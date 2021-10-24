import getFillStyle from '../internal/getFillStyle.js';
import storedPixelDataToCanvasImageData from '../internal/storedPixelDataToCanvasImageData.js';
import storedPixelDataToCanvasImageDataRGBA from '../internal/storedPixelDataToCanvasImageDataRGBA.js';
import setToPixelCoordinateSystem from '../setToPixelCoordinateSystem.js';
import now from '../internal/now.js';
import webGL from '../webgl/index.js';
import getLut from './getLut.js';
import doesImageNeedToBeRendered from './doesImageNeedToBeRendered.js';
import initializeRenderCanvas from './initializeRenderCanvas.js';
import saveLastRendered from './saveLastRendered.js';
import getDisplayedArea from '../internal/getDisplayedArea.js';

/**
 * Returns an appropriate canvas to render the Image. If the canvas available in the cache is appropriate
 * it is returned, otherwise adjustments are made. It also sets the color transfer functions.
 *
 * @param {Object} enabledElement The cornerstone enabled element
 * @param {Object} image The image to be rendered
 * @param {Boolean} invalidated Is pixel data valid
 * @param {Boolean} [useAlphaChannel = true] Will an alpha channel be used
 * @returns {HTMLCanvasElement} An appropriate canvas for rendering the image
 * @memberof rendering
 */
function getRenderCanvas (enabledElement, image, invalidated, useAlphaChannel = true) {
  const canvasWasColor = enabledElement.renderingTools.lastRenderedIsColor === true;

  if (!enabledElement.renderingTools.renderCanvas || canvasWasColor) {
    enabledElement.renderingTools.renderCanvas = document.createElement('canvas');
    initializeRenderCanvas(enabledElement, image);
  }

  const renderCanvas = enabledElement.renderingTools.renderCanvas;

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
  const lut = getLut(image, enabledElement.viewport, invalidated);

  image.stats = image.stats || {};
  image.stats.lastLutGenerateTime = now() - start;

  const renderCanvasData = enabledElement.renderingTools.renderCanvasData;
  const renderCanvasContext = enabledElement.renderingTools.renderCanvasContext;

  // Gray scale image - apply the lut and put the resulting image onto the render canvas
  if (useAlphaChannel) {
    storedPixelDataToCanvasImageData(image, lut, renderCanvasData.data);
  } else {
    storedPixelDataToCanvasImageDataRGBA(image, lut, renderCanvasData.data);
  }

  start = now();
  renderCanvasContext.putImageData(renderCanvasData, 0, 0);
  image.stats.lastPutImageDataTime = now() - start;

  return renderCanvas;
}

/**
 * API function to draw a grayscale image to a given enabledElement
 *
 * @param {EnabledElement} enabledElement The Cornerstone Enabled Element to redraw
 * @param {Boolean} invalidated - true if pixel data has been invalidated and cached rendering should not be used
 * @returns {void}
 * @memberof rendering
 */
export function renderGrayscaleImage (enabledElement, invalidated) {
  if (enabledElement === undefined) {
    throw new Error('drawImage: enabledElement parameter must not be undefined');
  }

  const image = enabledElement.image;

  if (image === undefined) {
    throw new Error('drawImage: image must be loaded before it can be drawn');
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

/**
 * API function to draw a grayscale image to a given layer
 *
 * @param {EnabledElementLayer} layer The layer that the image will be added to
 * @param {Boolean} invalidated - true if pixel data has been invalidated and cached rendering should not be used
 * @param {Boolean} [useAlphaChannel] - Whether or not to render the grayscale image using only the alpha channel.
                                        This does not work if this layer is not the first layer in the enabledElement.
 * @returns {void}
 */
export function addGrayscaleLayer (layer, invalidated, useAlphaChannel = false) {
  if (layer === undefined) {
    throw new Error('addGrayscaleLayer: layer parameter must not be undefined');
  }

  const image = layer.image;

  if (image === undefined) {
    throw new Error('addGrayscaleLayer: image must be loaded before it can be drawn');
  }

  layer.canvas = getRenderCanvas(layer, image, invalidated, useAlphaChannel);

  const context = layer.canvas.getContext('2d', {
    desynchronized: true
  });

  // Turn off image smooth/interpolation if pixelReplication is set in the viewport
  context.imageSmoothingEnabled = !layer.viewport.pixelReplication;
  context.mozImageSmoothingEnabled = context.imageSmoothingEnabled;

  layer.renderingTools = saveLastRendered(layer);
}
