import now from '../internal/now.js';
import getFillStyle from '../internal/getFillStyle.js';
import generateColorLut from '../internal/generateColorLut.js';
import storedColorPixelDataToCanvasImageData from '../internal/storedColorPixelDataToCanvasImageData.js';
import storedRGBAPixelDataToCanvasImageData from '../internal/storedRGBAPixelDataToCanvasImageData.js';
import setToPixelCoordinateSystem from '../setToPixelCoordinateSystem.js';
import webGL from '../webgl/index.js';
import doesImageNeedToBeRendered from './doesImageNeedToBeRendered.js';
import initializeRenderCanvas from './initializeRenderCanvas.js';
import saveLastRendered from './saveLastRendered.js';
import getDisplayedArea from '../internal/getDisplayedArea.js';


/**
 * Generates an appropriate Look Up Table to render the given image with the given window width and level (specified in the viewport)
 * Uses an internal cache for performance
 *
 * @param {Object} image  The image to be rendered
 * @param {Object} viewport The viewport values used for rendering
 * @returns {Uint8ClampedArray} Look Up Table array.
 * @memberof rendering
 */
function getLut (image, viewport) {
  // If we have a cached lut and it has the right values, return it immediately
  if (image.cachedLut !== undefined &&
    image.cachedLut.windowCenter === viewport.voi.windowCenter &&
    image.cachedLut.windowWidth === viewport.voi.windowWidth &&
    image.cachedLut.invert === viewport.invert) {
    return image.cachedLut.lutArray;
  }

  // Lut is invalid or not present, regenerate it and cache it
  generateColorLut(image, viewport.voi.windowWidth, viewport.voi.windowCenter, viewport.invert);
  image.cachedLut.windowWidth = viewport.voi.windowWidth;
  image.cachedLut.windowCenter = viewport.voi.windowCenter;
  image.cachedLut.invert = viewport.invert;

  return image.cachedLut.lutArray;
}

/**
 * Returns an appropriate canvas to render the Image. If the canvas available in the cache is appropriate
 * it is returned, otherwise adjustments are made. It also sets the color transfer functions.
 *
 * @param {Object} enabledElement The cornerstone enabled element
 * @param {Object} image The image to be rendered
 * @param {Boolean} invalidated Is pixel data valid
 * @returns {HTMLCanvasElement} An appropriate canvas for rendering the image
 * @memberof rendering
 */
function getRenderCanvas (enabledElement, image, invalidated) {
  const canvasWasColor = enabledElement.renderingTools.lastRenderedIsColor === true;

  if (!enabledElement.renderingTools.renderCanvas || !canvasWasColor) {
    enabledElement.renderingTools.renderCanvas = document.createElement('canvas');
  }

  const renderCanvas = enabledElement.renderingTools.renderCanvas;

  // The ww/wc is identity and not inverted - get a canvas with the image rendered into it for
  // Fast drawing
  if (enabledElement.viewport.voi.windowWidth === 255 &&
    enabledElement.viewport.voi.windowCenter === 128 &&
    enabledElement.viewport.invert === false &&
    image.getCanvas &&
    image.getCanvas()
  ) {
    return image.getCanvas();
  }

  // Apply the lut to the stored pixel data onto the render canvas
  if (doesImageNeedToBeRendered(enabledElement, image) === false && invalidated !== true) {
    return renderCanvas;
  }

  // If our render canvas does not match the size of this image reset it
  // NOTE: This might be inefficient if we are updating multiple images of different
  // Sizes frequently.
  if (renderCanvas.width !== image.width || renderCanvas.height !== image.height) {
    initializeRenderCanvas(enabledElement, image);
  }

  // Get the lut to use
  let start = now();
  const colorLut = getLut(image, enabledElement.viewport);

  image.stats = image.stats || {};
  image.stats.lastLutGenerateTime = now() - start;

  const renderCanvasData = enabledElement.renderingTools.renderCanvasData;
  const renderCanvasContext = enabledElement.renderingTools.renderCanvasContext;

  // The color image voi/invert has been modified - apply the lut to the underlying
  // Pixel data and put it into the renderCanvas
  if (image.rgba) {
    storedRGBAPixelDataToCanvasImageData(image, colorLut, renderCanvasData.data);
  } else {
    storedColorPixelDataToCanvasImageData(image, colorLut, renderCanvasData.data);
  }

  start = now();
  renderCanvasContext.putImageData(renderCanvasData, 0, 0);
  image.stats.lastPutImageDataTime = now() - start;

  return renderCanvas;
}

/**
 * API function to render a color image to an enabled element
 *
 * @param {EnabledElement} enabledElement The Cornerstone Enabled Element to redraw
 * @param {Boolean} invalidated - true if pixel data has been invalidated and cached rendering should not be used
 * @returns {void}
 * @memberof rendering
 */
export function renderColorImage (enabledElement, invalidated) {
  if (enabledElement === undefined) {
    throw new Error('renderColorImage: enabledElement parameter must not be undefined');
  }

  const image = enabledElement.image;

  if (image === undefined) {
    throw new Error('renderColorImage: image must be loaded before it can be drawn');
  }

  // Get the canvas context and reset the transform
  const context = enabledElement.canvas.getContext('2d', {
    desynchronized: true
  });

  context.setTransform(1, 0, 0, 1, 0, 0);

  // Clear the canvas
  context.fillStyle = getFillStyle(enabledElement);
  context.fillRect(0, 0, enabledElement.canvas.width, enabledElement.canvas.height);

  // Turn off image smooth/interpolation if pixelReplication is set in the viewport
  context.imageSmoothingEnabled = !enabledElement.viewport.pixelReplication;
  context.mozImageSmoothingEnabled = context.imageSmoothingEnabled;

  // Save the canvas context state and apply the viewport properties
  setToPixelCoordinateSystem(enabledElement, context);

  let renderCanvas;

  if (enabledElement.options && enabledElement.options.renderer &&
    enabledElement.options.renderer.toLowerCase() === 'webgl') {
    // If this enabled element has the option set for WebGL, we should
    // User it as our renderer.
    renderCanvas = webGL.renderer.render(enabledElement);
  } else {
    // If no options are set we will retrieve the renderCanvas through the
    // Normal Canvas rendering path
    renderCanvas = getRenderCanvas(enabledElement, image, invalidated);
  }

  const imageDisplayedArea = getDisplayedArea(enabledElement.image, enabledElement.viewport);
  const sx = imageDisplayedArea.tlhc.x - 1;
  const sy = imageDisplayedArea.tlhc.y - 1;
  const width = imageDisplayedArea.brhc.x - sx;
  const height = imageDisplayedArea.brhc.y - sy;

  context.drawImage(renderCanvas, sx, sy, width, height, sx, sy, width, height);

  enabledElement.renderingTools = saveLastRendered(enabledElement);
}

export function addColorLayer (layer, invalidated) {
  if (layer === undefined) {
    throw new Error('addColorLayer: layer parameter must not be undefined');
  }

  const image = layer.image;

  if (image === undefined) {
    throw new Error('addColorLayer: image must be loaded before it can be drawn');
  }

  // All multi-layer images should include the alpha value
  image.rgba = true;
  layer.canvas = getRenderCanvas(layer, image, invalidated);

  const context = layer.canvas.getContext('2d', {
    desynchronized: true
  });

  // Turn off image smooth/interpolation if pixelReplication is set in the viewport
  context.imageSmoothingEnabled = !layer.viewport.pixelReplication;
  context.mozImageSmoothingEnabled = context.imageSmoothingEnabled;

  layer.renderingTools = saveLastRendered(layer);
}
