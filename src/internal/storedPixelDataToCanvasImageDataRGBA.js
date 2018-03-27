import now from './now.js';

/**
 * This function transforms stored pixel values into a canvas image data buffer
 * by using a LUT.
 *
 * @param {Image} image A Cornerstone Image Object
 * @param {Array} lut Lookup table array
 * @param {Uint8ClampedArray} canvasImageDataData canvasImageData.data buffer filled with white pixels
 *
 * @returns {void}
 * @memberof Internal
 */
export default function (image, lut, canvasImageDataData) {
  let start = now();
  const pixelData = image.getPixelData();

  image.stats.lastGetPixelDataTime = now() - start;

  const numPixels = pixelData.length;
  const minPixelValue = image.minPixelValue;
  let canvasImageDataIndex = 0;
  let storedPixelDataIndex = 0;
  let pixelValue;

  // NOTE: As of Nov 2014, most javascript engines have lower performance when indexing negative indexes.
  // We have a special code path for this case that improves performance.  Thanks to @jpambrun for this enhancement

  // Added two paths (Int16Array, Uint16Array) to avoid polymorphic deoptimization in chrome.
  start = now();
  if (pixelData instanceof Int16Array) {
    if (minPixelValue < 0) {
      while (storedPixelDataIndex < numPixels) {
        pixelValue = lut[pixelData[storedPixelDataIndex++] + (-minPixelValue)];
        canvasImageDataData[canvasImageDataIndex++] = pixelValue;
        canvasImageDataData[canvasImageDataIndex++] = pixelValue;
        canvasImageDataData[canvasImageDataIndex++] = pixelValue;
        canvasImageDataData[canvasImageDataIndex++] = 255; // Alpha
      }
    } else {
      while (storedPixelDataIndex < numPixels) {
        pixelValue = lut[pixelData[storedPixelDataIndex++]];
        canvasImageDataData[canvasImageDataIndex++] = pixelValue;
        canvasImageDataData[canvasImageDataIndex++] = pixelValue;
        canvasImageDataData[canvasImageDataIndex++] = pixelValue;
        canvasImageDataData[canvasImageDataIndex++] = 255; // Alpha
      }
    }
  } else if (pixelData instanceof Uint16Array) {
    while (storedPixelDataIndex < numPixels) {
      pixelValue = lut[pixelData[storedPixelDataIndex++]];
      canvasImageDataData[canvasImageDataIndex++] = pixelValue;
      canvasImageDataData[canvasImageDataIndex++] = pixelValue;
      canvasImageDataData[canvasImageDataIndex++] = pixelValue;
      canvasImageDataData[canvasImageDataIndex++] = 255; // Alpha
    }
  } else if (minPixelValue < 0) {
    while (storedPixelDataIndex < numPixels) {
      pixelValue = lut[pixelData[storedPixelDataIndex++] + (-minPixelValue)];
      canvasImageDataData[canvasImageDataIndex++] = pixelValue;
      canvasImageDataData[canvasImageDataIndex++] = pixelValue;
      canvasImageDataData[canvasImageDataIndex++] = pixelValue;
      canvasImageDataData[canvasImageDataIndex++] = 255; // Alpha
    }
  } else {
    while (storedPixelDataIndex < numPixels) {
      pixelValue = lut[pixelData[storedPixelDataIndex++]];
      canvasImageDataData[canvasImageDataIndex++] = pixelValue;
      canvasImageDataData[canvasImageDataIndex++] = pixelValue;
      canvasImageDataData[canvasImageDataIndex++] = pixelValue;
      canvasImageDataData[canvasImageDataIndex++] = 255; // Alpha
    }
  }

  image.stats.lastStoredPixelDataToCanvasImageDataTime = now() - start;
}
