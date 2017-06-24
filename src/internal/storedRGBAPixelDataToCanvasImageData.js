import now from './now.js';

/**
 * Converts stored RGBA color pixel values to display pixel values using a LUT.
 *
 * @param {Image} image A Cornerstone Image Object
 * @param {Array} lut Lookup table array
 * @param {Uint8ClampedArray} canvasImageDataData canvasImageData.data buffer filled with white pixels
 *
 * @returns {void}
 */
export default function (image, lut, canvasImageDataData) {

  let start = now();
  const pixelData = image.getPixelData();

  image.stats.lastGetPixelDataTime = now() - start;

  const minPixelValue = image.minPixelValue;
  let canvasImageDataIndex = 0;
  let storedPixelDataIndex = 0;
  const numPixels = pixelData.length;

  // NOTE: As of Nov 2014, most javascript engines have lower performance when indexing negative indexes.
  // We have a special code path for this case that improves performance.  Thanks to @jpambrun for this enhancement
  start = now();
  if (minPixelValue < 0) {
    while (storedPixelDataIndex < numPixels) {
      canvasImageDataData[canvasImageDataIndex++] = lut[pixelData[storedPixelDataIndex++] + (-minPixelValue)]; // Red
      canvasImageDataData[canvasImageDataIndex++] = lut[pixelData[storedPixelDataIndex++] + (-minPixelValue)]; // Green
      canvasImageDataData[canvasImageDataIndex++] = lut[pixelData[storedPixelDataIndex++] + (-minPixelValue)]; // Blue
      canvasImageDataData[canvasImageDataIndex++] = pixelData[storedPixelDataIndex++];
    }
  } else {
    while (storedPixelDataIndex < numPixels) {
      canvasImageDataData[canvasImageDataIndex++] = lut[pixelData[storedPixelDataIndex++]]; // Red
      canvasImageDataData[canvasImageDataIndex++] = lut[pixelData[storedPixelDataIndex++]]; // Green
      canvasImageDataData[canvasImageDataIndex++] = lut[pixelData[storedPixelDataIndex++]]; // Blue
      canvasImageDataData[canvasImageDataIndex++] = pixelData[storedPixelDataIndex++];
    }
  }
  image.stats.lastStoredPixelDataToCanvasImageDataTime = now() - start;
}
