// internal (some of these are from old internal/legacy.js expose)
export { drawImage } from './internal/drawImage.js';
export { generateLut, generateLutNew } from './internal/generateLut.js';
export { getDefaultViewport } from './internal/getDefaultViewport.js';
export { requestAnimationFrame } from './internal/requestAnimationFrame.js';
export {
  storedPixelDataToCanvasImageData
} from './internal/storedPixelDataToCanvasImageData.js';
export {
  storedColorPixelDataToCanvasImageData
} from './internal/storedColorPixelDataToCanvasImageData.js';

// rendering
import { renderColorImage } from './rendering/renderColorImage.js';
import { renderGrayscaleImage } from './rendering/renderGrayscaleImage.js';
import { renderWebImage } from './rendering/renderWebImage.js';
export { renderColorImage, renderGrayscaleImage, renderWebImage };
export const rendering = {
  colorImage: renderColorImage,
  grayscaleImage: renderGrayscaleImage,
  webImage: renderWebImage,
};

export { addEventListener, dispatchEvent } from './addEventListener.js';
export { canvasToPixel } from './canvasToPixel.js';
export { disable } from './disable.js';
export { displayImage } from './displayImage.js';
export { draw } from './draw.js';
export { drawInvalidated } from './drawInvalidated.js';
export { enable } from './enable.js';
export { getElementData, removeElementData } from './enabledElementData.js';
export {
  getEnabledElement,
  addEnabledElement,
  getEnabledElementsByImageId,
  getEnabledElements
} from './enabledElements.js';
export { fitToWindow } from './fitToWindow.js';
export { getDefaultViewportForImage } from './getDefaultViewportForImage.js';
export { getImage } from './getImage.js';
export { getPixels } from './getPixels.js';
export { getStoredPixels } from './getStoredPixels.js';
export { getViewport } from './getViewport.js';
export {
  loadImage,
  loadAndCacheImage,
  registerImageLoader,
  registerUnknownImageLoader
} from './imageLoader.js';
export { invalidate } from './invalidate.js';
export { invalidateImageId } from './invalidateImageId.js';
export { pageToPixel } from './pageToPixel.js';
export { pixelToCanvas } from './pixelToCanvas.js';
export { reset } from './reset.js';
export { resize } from './resize.js';
export { setToPixelCoordinateSystem } from './setToPixelCoordinateSystem.js';
export { setViewport } from './setViewport.js';
export { updateImage } from './updateImage.js';

// funky exports, same api as before es6
import {
  imageCache as imageCacheDict, cachedImages, setMaximumSizeBytes, putImagePromise,
  getImagePromise, removeImagePromise, getCacheInfo, purgeCache,
  changeImageIdCacheSize,
} from './imageCache.js';
export const imageCache = {
  imageCache: imageCacheDict, cachedImages, setMaximumSizeBytes, putImagePromise,
  getImagePromise, removeImagePromise, getCacheInfo, purgeCache,
  changeImageIdCacheSize
};
import { addProvider, removeProvider, get } from './metaData.js';
export const metaData = { addProvider, removeProvider, get };
