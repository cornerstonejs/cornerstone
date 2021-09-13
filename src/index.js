// Internal (some of these are from old internal/legacy expose)

import { default as EVENTS, events } from './events.js';
import {
  addEnabledElement,
  getEnabledElement,
  getEnabledElements,
  getEnabledElementsByImageId
} from './enabledElements.js';
import {
  addLayer,
  getActiveLayer,
  getLayer,
  getLayers,
  getVisibleLayers,
  purgeLayers,
  removeLayer,
  setActiveLayer,
  setLayerImage
} from './layers.js';
import {
  convertImageToFalseColorImage,
  convertToFalseColorImage,
  restoreImage
} from './falseColorMapping.js';
import { getElementData, removeElementData } from './enabledElementData.js';
import {
  loadAndCacheImage,
  loadImage,
  registerImageLoader,
  registerUnknownImageLoader
} from './imageLoader.js';

import { default as canvasToPixel } from './canvasToPixel.js';
import { default as colors } from './colors/index.js';
import { default as disable } from './disable.js';
import { default as displayImage } from './displayImage.js';
import { default as draw } from './draw.js';
import { default as drawImage } from './internal/drawImage.js';
import { default as drawInvalidated } from './drawInvalidated.js';
import { default as enable } from './enable.js';
import { default as fitToWindow } from './fitToWindow.js';
import { default as generateLut } from './internal/generateLut.js';
import { default as getDefaultViewport } from './internal/getDefaultViewport.js';
import { default as getDefaultViewportForImage } from './getDefaultViewportForImage.js';
import { default as getImage } from './getImage.js';
import { default as getPixels } from './getPixels.js';
import { default as getStoredPixels } from './getStoredPixels.js';
import { default as getViewport } from './getViewport.js';
import { default as imageCache } from './imageCache.js';
import { default as internal } from './internal/index.js';
import { default as invalidate } from './invalidate.js';
import { default as invalidateImageId } from './invalidateImageId.js';
import { default as metaData } from './metaData.js';
import { default as pageToPixel } from './pageToPixel.js';
import { default as pixelDataToFalseColorData } from './pixelDataToFalseColorData.js';
import { default as pixelToCanvas } from './pixelToCanvas.js';
import { renderColorImage } from './rendering/renderColorImage.js';
import { renderGrayscaleImage } from './rendering/renderGrayscaleImage.js';
import { renderLabelMapImage } from './rendering/renderLabelMapImage.js';
import { renderPseudoColorImage } from './rendering/renderPseudoColorImage.js';
import { default as renderToCanvas } from './rendering/renderToCanvas.js';
import { renderWebImage } from './rendering/renderWebImage.js';
import { default as rendering } from './rendering/index.js';
import { default as requestAnimationFrame } from './internal/requestAnimationFrame.js';
import { default as reset } from './reset.js';
import { default as resize } from './resize.js';
import { default as setDefaultViewport } from './internal/setDefaultViewport.js';
import { default as setToPixelCoordinateSystem } from './setToPixelCoordinateSystem.js';
import { default as setViewport } from './setViewport.js';
import { default as storedColorPixelDataToCanvasImageData } from './internal/storedColorPixelDataToCanvasImageData.js';
import { default as storedPixelDataToCanvasImageData } from './internal/storedPixelDataToCanvasImageData.js';
import { default as storedPixelDataToCanvasImageDataColorLUT } from './internal/storedPixelDataToCanvasImageDataColorLUT.js';
import { default as storedPixelDataToCanvasImageDataPseudocolorLUT } from './internal/storedPixelDataToCanvasImageDataPseudocolorLUT.js';
import { default as triggerEvent } from './triggerEvent.js';
import { default as updateImage } from './updateImage.js';
import { default as webGL } from './webgl/index.js';

// Rendering
/**
 * @module PixelCoordinateSystem
 */

/**
 * @module ViewportSettings
 */


const cornerstone = {
  drawImage,
  generateLut,
  getDefaultViewport,
  requestAnimationFrame,
  storedPixelDataToCanvasImageData,
  storedColorPixelDataToCanvasImageData,
  storedPixelDataToCanvasImageDataColorLUT,
  storedPixelDataToCanvasImageDataPseudocolorLUT,
  internal,
  renderLabelMapImage,
  renderPseudoColorImage,
  renderColorImage,
  renderGrayscaleImage,
  renderWebImage,
  renderToCanvas,
  canvasToPixel,
  disable,
  displayImage,
  draw,
  drawInvalidated,
  enable,
  getElementData,
  removeElementData,
  getEnabledElement,
  addEnabledElement,
  getEnabledElementsByImageId,
  getEnabledElements,
  addLayer,
  removeLayer,
  getLayer,
  getLayers,
  getVisibleLayers,
  setActiveLayer,
  getActiveLayer,
  purgeLayers,
  setLayerImage,
  fitToWindow,
  getDefaultViewportForImage,
  setDefaultViewport,
  getImage,
  getPixels,
  getStoredPixels,
  getViewport,
  loadImage,
  loadAndCacheImage,
  registerImageLoader,
  registerUnknownImageLoader,
  invalidate,
  invalidateImageId,
  pageToPixel,
  pixelToCanvas,
  reset,
  resize,
  setToPixelCoordinateSystem,
  setViewport,
  updateImage,
  pixelDataToFalseColorData,
  rendering,
  imageCache,
  metaData,
  webGL,
  colors,
  convertImageToFalseColorImage,
  convertToFalseColorImage,
  restoreImage,
  EVENTS,
  events,
  triggerEvent
};

export {
  drawImage,
  generateLut,
  getDefaultViewport,
  setDefaultViewport,
  requestAnimationFrame,
  storedPixelDataToCanvasImageData,
  storedColorPixelDataToCanvasImageData,
  storedPixelDataToCanvasImageDataColorLUT,
  storedPixelDataToCanvasImageDataPseudocolorLUT,
  internal,
  renderLabelMapImage,
  renderPseudoColorImage,
  renderColorImage,
  renderGrayscaleImage,
  renderWebImage,
  renderToCanvas,
  canvasToPixel,
  disable,
  displayImage,
  draw,
  drawInvalidated,
  enable,
  getElementData,
  removeElementData,
  getEnabledElement,
  addEnabledElement,
  getEnabledElementsByImageId,
  getEnabledElements,
  addLayer,
  removeLayer,
  getLayer,
  getLayers,
  getVisibleLayers,
  setActiveLayer,
  getActiveLayer,
  purgeLayers,
  setLayerImage,
  fitToWindow,
  getDefaultViewportForImage,
  getImage,
  getPixels,
  getStoredPixels,
  getViewport,
  loadImage,
  loadAndCacheImage,
  registerImageLoader,
  registerUnknownImageLoader,
  invalidate,
  invalidateImageId,
  pageToPixel,
  pixelToCanvas,
  reset,
  resize,
  setToPixelCoordinateSystem,
  setViewport,
  updateImage,
  pixelDataToFalseColorData,
  rendering,
  imageCache,
  metaData,
  webGL,
  colors,
  convertImageToFalseColorImage,
  convertToFalseColorImage,
  restoreImage,
  EVENTS,
  events,
  triggerEvent
};

export default cornerstone;
