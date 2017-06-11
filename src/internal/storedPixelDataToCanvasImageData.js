import now from './now.js';

/**
 * This function transforms stored pixel values into a canvas image data buffer
 * by using a LUT.  This is the most performance sensitive code in cornerstone and
 * we use a special trick to make this go as fast as possible.  Specifically we
 * use the alpha channel only to control the luminance rather than the red, green and
 * blue channels which makes it over 3x faster. The canvasImageDataData buffer needs
 * to be previously filled with white pixels.
 *
 * NOTE: Attribution would be appreciated if you use this technique!
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

  const numPixels = pixelData.length;
  const minPixelValue = image.minPixelValue;
  let canvasImageDataIndex = 3;
  let storedPixelDataIndex = 0;


  // NOTE: As of Nov 2014, most javascript engines have lower performance when indexing negative indexes.
  // We have a special code path for this case that improves performance.  Thanks to @jpambrun for this enhancement

  // Added two paths (Int16Array, Uint16Array) to avoid polymorphic deoptimization in chrome.
  start = now();
  if (pixelData instanceof Int16Array) {
    if (minPixelValue < 0) {
      while (storedPixelDataIndex < numPixels) {
        canvasImageDataData[canvasImageDataIndex] = lut[pixelData[storedPixelDataIndex++] + (-minPixelValue)]; // Alpha
        canvasImageDataIndex += 4;
      }
    } else {
      while (storedPixelDataIndex < numPixels) {
        canvasImageDataData[canvasImageDataIndex] = lut[pixelData[storedPixelDataIndex++]]; // Alpha
        canvasImageDataIndex += 4;
      }
    }
  } else if (pixelData instanceof Uint16Array) {
    while (storedPixelDataIndex < numPixels) {
      canvasImageDataData[canvasImageDataIndex] = lut[pixelData[storedPixelDataIndex++]]; // Alpha
      canvasImageDataIndex += 4;
    }
  } else if (minPixelValue < 0) {
    while (storedPixelDataIndex < numPixels) {
      canvasImageDataData[canvasImageDataIndex] = lut[pixelData[storedPixelDataIndex++] + (-minPixelValue)]; // Alpha
      canvasImageDataIndex += 4;
    }
  } else {
    while (storedPixelDataIndex < numPixels) {
      canvasImageDataData[canvasImageDataIndex] = lut[pixelData[storedPixelDataIndex++]]; // Alpha
      canvasImageDataIndex += 4;
    }
  }

  image.stats.lastStoredPixelDataToCanvasImageDataTime = now() - start;
}
