import setToPixelCoordinateSystem from '../setToPixelCoordinateSystem.js';
import now from '../internal/now.js';
import getFillStyle from '../internal/getFillStyle.js';
import initializeRenderCanvas from './initializeRenderCanvas.js';
import saveLastRendered from './saveLastRendered.js';
import doesImageNeedToBeRendered from './doesImageNeedToBeRendered.js';
import storedPixelDataToCanvasImageDataColorLUT from '../internal/storedPixelDataToCanvasImageDataColorLUT.js';
import colors from '../colors/index.js';
import getDisplayedArea from '../internal/getDisplayedArea.js';

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
  if (!enabledElement.renderingTools.renderCanvas) {
    enabledElement.renderingTools.renderCanvas = document.createElement('canvas');
  }

  const renderCanvas = enabledElement.renderingTools.renderCanvas;

  let colormap = enabledElement.viewport.colormap || enabledElement.options.colormap;

  if (enabledElement.options.colormap) {
    console.warn('enabledElement.options.colormap is deprecated. Use enabledElement.viewport.colormap instead');
  }

  if (colormap && (typeof colormap === 'string')) {
    colormap = colors.getColormap(colormap);
  }

  if (!colormap) {
    throw new Error('renderLabelMapImage: colormap not found.');
  }

  const colormapId = colormap.getId();

  if (doesImageNeedToBeRendered(enabledElement, image) === false && invalidated !== true &&
    enabledElement.renderingTools.colormapId === colormapId) {
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

  if (!enabledElement.renderingTools.colorLut || invalidated ||
    enabledElement.renderingTools.colormapId !== colormapId) {
    enabledElement.renderingTools.colorLut = colormap.createLookupTable();
    enabledElement.renderingTools.colormapId = colormapId;
  }

  image.stats = image.stats || {};
  image.stats.lastLutGenerateTime = now() - start;

  const colorLut = enabledElement.renderingTools.colorLut;
  const renderCanvasData = enabledElement.renderingTools.renderCanvasData;
  const renderCanvasContext = enabledElement.renderingTools.renderCanvasContext;

  storedPixelDataToCanvasImageDataColorLUT(image, colorLut, renderCanvasData.data);

  start = now();
  renderCanvasContext.putImageData(renderCanvasData, 0, 0);
  image.stats.lastPutImageDataTime = now() - start;

  return renderCanvas;
}

/**
 * API function to draw a label map image to a given enabledElement
 *
 * @param {EnabledElement} enabledElement The Cornerstone Enabled Element to redraw
 * @param {Boolean} invalidated - true if pixel data has been invalidated and cached rendering should not be used
 * @returns {void}
 * @memberof rendering
 */
export function renderLabelMapImage (enabledElement, invalidated) {
  if (enabledElement === undefined) {
    throw new Error('renderLabelMapImage: enabledElement parameter must not be undefined');
  }

  const image = enabledElement.image;

  if (image === undefined) {
    throw new Error('renderLabelMapImage: image must be loaded before it can be drawn');
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

  // If no options are set we will retrieve the renderCanvas through the
  // Normal Canvas rendering path
  // TODO: Add WebGL support for label map pipeline
  const renderCanvas = getRenderCanvas(enabledElement, image, invalidated);
  const imageDisplayedArea = getDisplayedArea(enabledElement.image, enabledElement.viewport);
  const sx = imageDisplayedArea.tlhc.x - 1;
  const sy = imageDisplayedArea.tlhc.y - 1;
  const width = imageDisplayedArea.brhc.x - sx;
  const height = imageDisplayedArea.brhc.y - sy;

  context.drawImage(renderCanvas, sx, sy, width, height, sx, sy, width, height);

  enabledElement.renderingTools = saveLastRendered(enabledElement);
}

/**
 * API function to draw a pseudo-color image to a given layer
 *
 * @param {EnabledElementLayer} layer The layer that the image will be added to
 * @param {Boolean} invalidated - true if pixel data has been invalidated and cached rendering should not be used
 * @returns {void}
 */
export function addLabelMapLayer (layer, invalidated) {
  if (layer === undefined) {
    throw new Error('addLabelMapLayer: layer parameter must not be undefined');
  }

  const image = layer.image;

  if (image === undefined) {
    throw new Error('addLabelMapLayer: image must be loaded before it can be drawn');
  }

  layer.canvas = getRenderCanvas(layer, image, invalidated);

  const context = layer.canvas.getContext('2d', {
    desynchronized: true
  });

  // Turn off image smooth/interpolation if pixelReplication is set in the viewport
  context.imageSmoothingEnabled = !layer.viewport.pixelReplication;
  context.mozImageSmoothingEnabled = context.imageSmoothingEnabled;

  layer.renderingTools = saveLastRendered(layer);
}
