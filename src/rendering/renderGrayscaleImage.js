/**
 * This module is responsible for drawing a grayscale image
 */
import generateLut from '../internal/generateLut.js';
import storedPixelDataToCanvasImageData from '../internal/storedPixelDataToCanvasImageData.js';
import setToPixelCoordinateSystem from '../setToPixelCoordinateSystem.js';
import now from '../internal/now.js';
import webGL from '../webgl/index.js';

function initializeGrayscaleRenderCanvas (enabledElement, image) {
  const grayscaleRenderCanvas = enabledElement.renderingTools.grayscaleRenderCanvas;
    // Resize the canvas

  grayscaleRenderCanvas.width = image.width;
  grayscaleRenderCanvas.height = image.height;

    // NOTE - we need to fill the render canvas with white pixels since we control the luminance
    // Using the alpha channel to improve rendering performance.
  const grayscaleRenderCanvasContext = grayscaleRenderCanvas.getContext('2d');

  grayscaleRenderCanvasContext.fillStyle = 'white';
  grayscaleRenderCanvasContext.fillRect(0, 0, grayscaleRenderCanvas.width, grayscaleRenderCanvas.height);
  const grayscaleRenderCanvasData = grayscaleRenderCanvasContext.getImageData(0, 0, image.width, image.height);

  enabledElement.renderingTools.grayscaleRenderCanvasContext = grayscaleRenderCanvasContext;
  enabledElement.renderingTools.grayscaleRenderCanvasData = grayscaleRenderCanvasData;
}

function lutMatches (a, b) {
  // If undefined, they are equal
  if (!a && !b) {
    return true;
  }
  // If one is undefined, not equal
  if (!a || !b) {
    return false;
  }

  // Check the unique ids
  return (a.id === b.id);
}

function getLut (image, viewport, invalidated) {
    // If we have a cached lut and it has the right values, return it immediately
  if (image.cachedLut !== undefined &&
        image.cachedLut.windowCenter === viewport.voi.windowCenter &&
        image.cachedLut.windowWidth === viewport.voi.windowWidth &&
        lutMatches(image.cachedLut.modalityLUT, viewport.modalityLUT) &&
        lutMatches(image.cachedLut.voiLUT, viewport.voiLUT) &&
        image.cachedLut.invert === viewport.invert &&
        invalidated !== true) {
    return image.cachedLut.lutArray;
  }

    // Lut is invalid or not present, regenerate it and cache it
  generateLut(image, viewport.voi.windowWidth, viewport.voi.windowCenter, viewport.invert, viewport.modalityLUT, viewport.voiLUT);
  image.cachedLut.windowWidth = viewport.voi.windowWidth;
  image.cachedLut.windowCenter = viewport.voi.windowCenter;
  image.cachedLut.invert = viewport.invert;
  image.cachedLut.voiLUT = viewport.voiLUT;
  image.cachedLut.modalityLUT = viewport.modalityLUT;

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
    lastRenderedViewport.vflip !== enabledElement.viewport.vflip ||
    lastRenderedViewport.modalityLUT !== enabledElement.viewport.modalityLUT ||
    lastRenderedViewport.voiLUT !== enabledElement.viewport.voiLUT
  );
}

function getRenderCanvas (enabledElement, image, invalidated) {
  if (!enabledElement.renderingTools.grayscaleRenderCanvas) {
    enabledElement.renderingTools.grayscaleRenderCanvas = document.createElement('canvas');
  }

  const grayscaleRenderCanvas = enabledElement.renderingTools.grayscaleRenderCanvas;

    // Apply the lut to the stored pixel data onto the render canvas

  if (doesImageNeedToBeRendered(enabledElement, image) === false && invalidated !== true) {
    return grayscaleRenderCanvas;
  }

    // If our render canvas does not match the size of this image reset it
    // NOTE: This might be inefficient if we are updating multiple images of different
    // Sizes frequently.
  if (grayscaleRenderCanvas.width !== image.width || grayscaleRenderCanvas.height !== image.height) {
    initializeGrayscaleRenderCanvas(enabledElement, image);
  }

    // Get the lut to use
  let start = now();
  const lut = getLut(image, enabledElement.viewport, invalidated);

  image.stats = image.stats || {};
  image.stats.lastLutGenerateTime = now() - start;

  const grayscaleRenderCanvasData = enabledElement.renderingTools.grayscaleRenderCanvasData;
  const grayscaleRenderCanvasContext = enabledElement.renderingTools.grayscaleRenderCanvasContext;
    // Gray scale image - apply the lut and put the resulting image onto the render canvas

  storedPixelDataToCanvasImageData(image, lut, grayscaleRenderCanvasData.data);

  start = now();
  grayscaleRenderCanvasContext.putImageData(grayscaleRenderCanvasData, 0, 0);
  image.stats.lastPutImageDataTime = now() - start;

  return grayscaleRenderCanvas;
}

/**
 * API function to draw a grayscale image to a given enabledElement
 *
 * @param {EnabledElement} enabledElement The Cornerstone Enabled Element to redraw
 * @param {Boolean} invalidated - true if pixel data has been invalidated and cached rendering should not be used
 * @returns {void}
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
  setToPixelCoordinateSystem(enabledElement, context);

  if (!enabledElement.renderingTools) {
    enabledElement.renderingTools = {};
  }

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

    // Draw the render canvas half the image size (because we set origin to the middle of the canvas above)
  context.drawImage(renderCanvas, 0, 0, image.width, image.height, 0, 0, image.width, image.height);

  enabledElement.renderingTools.lastRenderedImageId = image.imageId;
  const lastRenderedViewport = {};

  lastRenderedViewport.windowCenter = enabledElement.viewport.voi.windowCenter;
  lastRenderedViewport.windowWidth = enabledElement.viewport.voi.windowWidth;
  lastRenderedViewport.invert = enabledElement.viewport.invert;
  lastRenderedViewport.rotation = enabledElement.viewport.rotation;
  lastRenderedViewport.hflip = enabledElement.viewport.hflip;
  lastRenderedViewport.vflip = enabledElement.viewport.vflip;
  lastRenderedViewport.modalityLUT = enabledElement.viewport.modalityLUT;
  lastRenderedViewport.voiLUT = enabledElement.viewport.voiLUT;
  enabledElement.renderingTools.lastRenderedViewport = lastRenderedViewport;
}

/**
 * API function to draw a grayscale image to a given layer
 *
 * @param {EnabledElementLayer} layer The layer that the image will be added to
 * @param {Boolean} invalidated - true if pixel data has been invaldiated and cached rendering should not be used
 * @returns {void}
 */
export function addGrayscaleLayer (layer, invalidated) {
  if (layer === undefined) {
    throw new Error('addGrayscaleLayer: layer parameter must not be undefined');
  }

  const image = layer.image;

  if (image === undefined) {
    throw new Error('addGrayscaleLayer: image must be loaded before it can be drawn');
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

