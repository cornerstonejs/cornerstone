import colors from '../colors/index.js';
import now from './now.js';

/**
 *
 * @param {Image} image A Cornerstone Image Object
 * @param {LookupTable|Array} colorLut Lookup table array
 * @param {Uint8ClampedArray} canvasImageDataData canvasImageData.data buffer filled with white pixels
 *
 * @returns {void}
 * @memberof Internal
 */
function storedPixelDataToCanvasImageDataColorLUT (image, colorLut, canvasImageDataData) {
  let start = now();
  const pixelData = image.getPixelData();

  image.stats.lastGetPixelDataTime = now() - start;

  const numPixels = pixelData.length;
  const minPixelValue = image.minPixelValue;
  let canvasImageDataIndex = 0;
  let storedPixelDataIndex = 0;
  let rgba;
  let clut;

  start = now();

  if (colorLut instanceof colors.LookupTable) {
    clut = colorLut.Table;
  } else {
    clut = colorLut;
  }

  if (minPixelValue < 0) {
    while (storedPixelDataIndex < numPixels) {
      rgba = clut[pixelData[storedPixelDataIndex++] + (-minPixelValue)];
      canvasImageDataData[canvasImageDataIndex++] = rgba[0];
      canvasImageDataData[canvasImageDataIndex++] = rgba[1];
      canvasImageDataData[canvasImageDataIndex++] = rgba[2];
      canvasImageDataData[canvasImageDataIndex++] = rgba[3];
    }
  } else {
    while (storedPixelDataIndex < numPixels) {
      rgba = clut[pixelData[storedPixelDataIndex++]];
      canvasImageDataData[canvasImageDataIndex++] = rgba[0];
      canvasImageDataData[canvasImageDataIndex++] = rgba[1];
      canvasImageDataData[canvasImageDataIndex++] = rgba[2];
      canvasImageDataData[canvasImageDataIndex++] = rgba[3];
    }
  }

  image.stats.lastStoredPixelDataToCanvasImageDataTime = now() - start;
}

export default storedPixelDataToCanvasImageDataColorLUT;
