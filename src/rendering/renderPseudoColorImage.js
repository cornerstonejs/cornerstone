import setToPixelCoordinateSystem from '../setToPixelCoordinateSystem.js';
import now from '../internal/now.js';
import initializeRenderCanvas from './initializeRenderCanvas.js';
import getLut from './getLut.js';
import saveLastRendered from './saveLastRendered.js';
import doesImageNeedToBeRendered from './doesImageNeedToBeRendered.js';
import storedPixelDataToCanvasImageDataPseudocolorLUT from '../internal/storedPixelDataToCanvasImageDataPseudocolorLUT.js';
import colors from '../colors/index.js';

function getRenderCanvas (enabledElement, image, invalidated) {
  if (!enabledElement.renderingTools.renderCanvas) {
    enabledElement.renderingTools.renderCanvas = document.createElement('canvas');
  }

  const renderCanvas = enabledElement.renderingTools.renderCanvas;

  // TODO: Deprecate enabledElement.options.colormap
  let colormap = enabledElement.viewport.colormap || enabledElement.options.colormap;

  if (colormap && (typeof colormap === 'string')) {
    colormap = colors.getColormap(colormap);
  }

  if (!colormap) {
    throw new Error('renderPseudoColorImage: colormap not found.');
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
    colormap.setNumberOfColors(256);
    enabledElement.renderingTools.colorLut = colormap.createLookupTable();
    enabledElement.renderingTools.colormapId = colormapId;
  }

  const lut = getLut(image, enabledElement.viewport, invalidated);

  image.stats = image.stats || {};
  image.stats.lastLutGenerateTime = now() - start;

  const colorLut = enabledElement.renderingTools.colorLut;
  const renderCanvasData = enabledElement.renderingTools.renderCanvasData;
  const renderCanvasContext = enabledElement.renderingTools.renderCanvasContext;

  storedPixelDataToCanvasImageDataPseudocolorLUT(image, lut, colorLut, renderCanvasData.data);

  start = now();
  renderCanvasContext.putImageData(renderCanvasData, 0, 0);
  image.stats.lastPutImageDataTime = now() - start;

  return renderCanvas;
}

/**
 * API function to draw a pseudo-color image to a given enabledElement
 *
 * @param {EnabledElement} enabledElement The Cornerstone Enabled Element to redraw
 * @param {Boolean} invalidated - true if pixel data has been invalidated and cached rendering should not be used
 * @returns {void}
 * @memberof rendering
 */
export function renderPseudoColorImage (enabledElement, invalidated) {
  if (enabledElement === undefined) {
    throw new Error('drawImage: enabledElement parameter must not be undefined');
  }

  const image = enabledElement.image;

  if (image === undefined) {
    throw new Error('drawImage: image must be loaded before it can be drawn');
  }

  // Get the canvas context and reset the transform
  const context = enabledElement.canvas.getContext('2d');

  context.setTransform(1, 0, 0, 1, 0, 0);

  // Clear the canvas
  context.fillStyle = 'black';
  context.fillRect(0, 0, enabledElement.canvas.width, enabledElement.canvas.height);

  // Turn off image smooth/interpolation if pixelReplication is set in the viewport
  context.imageSmoothingEnabled = !enabledElement.viewport.pixelReplication;
  context.mozImageSmoothingEnabled = context.imageSmoothingEnabled;

  // Save the canvas context state and apply the viewport properties
  setToPixelCoordinateSystem(enabledElement, context);


  // If no options are set we will retrieve the renderCanvas through the
  // Normal Canvas rendering path
  // TODO: Add WebGL support for pseudocolor pipeline
  const renderCanvas = getRenderCanvas(enabledElement, image, invalidated);

  const sx = enabledElement.viewport.displayedArea.tlhc.x - 1;
  const sy = enabledElement.viewport.displayedArea.tlhc.y - 1;
  const width = enabledElement.viewport.displayedArea.brhc.x - enabledElement.viewport.displayedArea.tlhc.x;
  const height = enabledElement.viewport.displayedArea.brhc.y - enabledElement.viewport.displayedArea.tlhc.y;

  context.drawImage(renderCanvas, sx, sy, width, height, 0, 0, width, height);

  enabledElement.renderingTools = saveLastRendered(enabledElement);
}

/**
 * API function to draw a pseudo-color image to a given layer
 *
 * @param {EnabledElementLayer} layer The layer that the image will be added to
 * @param {Boolean} invalidated - true if pixel data has been invalidated and cached rendering should not be used
 * @returns {void}
 */
export function addPseudoColorLayer (layer, invalidated) {
  if (layer === undefined) {
    throw new Error('addPseudoColorLayer: layer parameter must not be undefined');
  }

  const image = layer.image;

  if (image === undefined) {
    throw new Error('addPseudoColorLayer: image must be loaded before it can be drawn');
  }

  layer.canvas = getRenderCanvas(layer, image, invalidated);

  const context = layer.canvas.getContext('2d');

  // Turn off image smooth/interpolation if pixelReplication is set in the viewport
  context.imageSmoothingEnabled = !layer.viewport.pixelReplication;
  context.mozImageSmoothingEnabled = context.imageSmoothingEnabled;

  layer.renderingTools = saveLastRendered(layer);
}
