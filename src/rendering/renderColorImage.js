/**
 * This module is responsible for drawing an image to an enabled elements canvas element
 */
import generateLut from '../internal/generateLut.js';
import storedColorPixelDataToCanvasImageData from '../internal/storedColorPixelDataToCanvasImageData.js';
import storedRGBAPixelDataToCanvasImageData from '../internal/storedRGBAPixelDataToCanvasImageData.js';
import setToPixelCoordinateSystem from '../setToPixelCoordinateSystem.js';
import webGL from '../webgl/index.js';

function initializeColorRenderCanvas (enabledElement, image) {
  const colorRenderCanvas = enabledElement.renderingTools.colorRenderCanvas;
    // Resize the canvas

  colorRenderCanvas.width = image.width;
  colorRenderCanvas.height = image.height;

    // Get the canvas data so we can write to it directly
  const colorRenderCanvasContext = colorRenderCanvas.getContext('2d');

  colorRenderCanvasContext.fillStyle = 'white';
  colorRenderCanvasContext.fillRect(0, 0, colorRenderCanvas.width, colorRenderCanvas.height);
  const colorRenderCanvasData = colorRenderCanvasContext.getImageData(0, 0, image.width, image.height);

  enabledElement.renderingTools.colorRenderCanvasContext = colorRenderCanvasContext;
  enabledElement.renderingTools.colorRenderCanvasData = colorRenderCanvasData;
}


function getLut (image, viewport) {
    // If we have a cached lut and it has the right values, return it immediately
  if (image.cachedLut !== undefined &&
        image.cachedLut.windowCenter === viewport.voi.windowCenter &&
        image.cachedLut.windowWidth === viewport.voi.windowWidth &&
        image.cachedLut.invert === viewport.invert) {
    return image.cachedLut.lutArray;
  }

    // Lut is invalid or not present, regenerate it and cache it
  generateLut(image, viewport.voi.windowWidth, viewport.voi.windowCenter, viewport.invert);
  image.cachedLut.windowWidth = viewport.voi.windowWidth;
  image.cachedLut.windowCenter = viewport.voi.windowCenter;
  image.cachedLut.invert = viewport.invert;

  return image.cachedLut.lutArray;
}

function doesImageNeedToBeRendered (enabledElement, image) {
  const lastRenderedImageId = enabledElement.renderingTools.lastRenderedImageId;
  const lastRenderedViewport = enabledElement.renderingTools.lastRenderedViewport;

  return (
    image.imageId !== lastRenderedImageId ||
    !lastRenderedViewport ||
    lastRenderedViewport.windowCenter !== enabledElement.viewport.voi.windowCenter ||
    lastRenderedViewport.windowWidth !== enabledElement.viewport.voi.windowWidth ||
    lastRenderedViewport.invert !== enabledElement.viewport.invert ||
    lastRenderedViewport.rotation !== enabledElement.viewport.rotation ||
    lastRenderedViewport.hflip !== enabledElement.viewport.hflip ||
    lastRenderedViewport.vflip !== enabledElement.viewport.vflip
  );
}

function getRenderCanvas (enabledElement, image, invalidated) {
  if (!enabledElement.renderingTools.colorRenderCanvas) {
    enabledElement.renderingTools.colorRenderCanvas = document.createElement('canvas');
  }

  const colorRenderCanvas = enabledElement.renderingTools.colorRenderCanvas;

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
    return colorRenderCanvas;
  }

    // If our render canvas does not match the size of this image reset it
    // NOTE: This might be inefficient if we are updating multiple images of different
    // Sizes frequently.
  if (colorRenderCanvas.width !== image.width || colorRenderCanvas.height !== image.height) {
    initializeColorRenderCanvas(enabledElement, image);
  }

    // Get the lut to use
  let start = (window.performance ? performance.now() : Date.now());
  const colorLut = getLut(image, enabledElement.viewport);

  image.stats = image.stats || {};
  image.stats.lastLutGenerateTime = (window.performance ? performance.now() : Date.now()) - start;

  const colorRenderCanvasData = enabledElement.renderingTools.colorRenderCanvasData;
  const colorRenderCanvasContext = enabledElement.renderingTools.colorRenderCanvasContext;

  // The color image voi/invert has been modified - apply the lut to the underlying
  // Pixel data and put it into the renderCanvas
  if (image.rgba) {
    storedRGBAPixelDataToCanvasImageData(image, colorLut, colorRenderCanvasData.data);
  } else {
    storedColorPixelDataToCanvasImageData(image, colorLut, colorRenderCanvasData.data);
  }

  start = (window.performance ? performance.now() : Date.now());
  colorRenderCanvasContext.putImageData(colorRenderCanvasData, 0, 0);
  image.stats.lastPutImageDataTime = (window.performance ? performance.now() : Date.now()) - start;

  return colorRenderCanvas;
}

/**
 * API function to render a color image to an enabled element
 *
 * @param {EnabledElement} enabledElement The Cornerstone Enabled Element to redraw
 * @param {Boolean} invalidated - true if pixel data has been invalidated and cached rendering should not be used
 * @returns {void}
 */
export function renderColorImage (enabledElement, invalidated) {

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
  if (enabledElement.viewport.pixelReplication === true) {
    context.imageSmoothingEnabled = false;
    context.mozImageSmoothingEnabled = false; // Firefox doesn't support imageSmoothingEnabled yet
  } else {
    context.imageSmoothingEnabled = true;
    context.mozImageSmoothingEnabled = true;
  }

  // Save the canvas context state and apply the viewport properties
  context.save();
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

  context.drawImage(renderCanvas, 0, 0, image.width, image.height, 0, 0, image.width, image.height);

  context.restore();

  enabledElement.renderingTools.lastRenderedImageId = image.imageId;
  const lastRenderedViewport = {};

  lastRenderedViewport.windowCenter = enabledElement.viewport.voi.windowCenter;
  lastRenderedViewport.windowWidth = enabledElement.viewport.voi.windowWidth;
  lastRenderedViewport.invert = enabledElement.viewport.invert;
  lastRenderedViewport.rotation = enabledElement.viewport.rotation;
  lastRenderedViewport.hflip = enabledElement.viewport.hflip;
  lastRenderedViewport.vflip = enabledElement.viewport.vflip;
  enabledElement.renderingTools.lastRenderedViewport = lastRenderedViewport;
}

export function addColorLayer (layer, invalidated) {
  if (layer === undefined) {
    throw new Error('addColorLayer: layer parameter must not be undefined');
  }

  const image = layer.image;

  // All multi-layer images should include the alpha value
  image.rgba = true;

  if (image === undefined) {
    throw new Error('addColorLayer: image must be loaded before it can be drawn');
  }

  layer.renderingTools = layer.renderingTools || {};
  layer.canvas = getRenderCanvas(layer, image, invalidated);

  const context = layer.canvas.getContext('2d');

  if (layer.viewport.pixelReplication === true) {
    context.imageSmoothingEnabled = false;
    context.mozImageSmoothingEnabled = false;
  } else {
    context.imageSmoothingEnabled = true;
    context.mozImageSmoothingEnabled = true;
  }

  const lastRenderedViewport = {
    windowCenter: layer.viewport.voi.windowCenter,
    windowWidth: layer.viewport.voi.windowWidth,
    invert: layer.viewport.invert,
    rotation: layer.viewport.rotation,
    hflip: layer.viewport.hflip,
    vflip: layer.viewport.vflip
  };

  layer.renderingTools.lastRenderedImageId = image.imageId;
  layer.renderingTools.lastRenderedViewport = lastRenderedViewport;
}
