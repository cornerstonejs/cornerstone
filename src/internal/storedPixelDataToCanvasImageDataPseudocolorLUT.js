import colors from '../colors/index.js';
import now from './now.js';

/**
 *
 * @param {Image} image A Cornerstone Image Object
 * @param {Array} grayscaleLut Lookup table array
 * @param {LookupTable|Array} colorLut Lookup table array
 * @param {Uint8ClampedArray} canvasImageDataData canvasImageData.data buffer filled with white pixels
 *
 * @returns {void}
 * @memberof Internal
 */
function storedPixelDataToCanvasImageDataPseudocolorLUT (image, grayscaleLut, colorLut, canvasImageDataData) {
  let start = now();
  const pixelData = image.getPixelData();

  image.stats.lastGetPixelDataTime = now() - start;

  const numPixels = pixelData.length;
  const minPixelValue = image.minPixelValue;
  let canvasImageDataIndex = 0;
  let storedPixelDataIndex = 0;
  let grayscale;
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
      //  Find the grayscale of 4 channels image data by calculating relative luminance value
      if (image.color && ((image.width * image.height * 4) === numPixels)) {
        const rValue = pixelData[storedPixelDataIndex++];
        const gValue = pixelData[storedPixelDataIndex++];
        const bValue = pixelData[storedPixelDataIndex++];

        storedPixelDataIndex++; // The pixel data has 4 channels

        const luminance = getRelativeLuminance(rValue, gValue, bValue);

        grayscale = grayscaleLut[luminance + (-minPixelValue)];
      } else {
        grayscale = grayscaleLut[pixelData[storedPixelDataIndex++] + (-minPixelValue)];
      }
      rgba = clut[grayscale];
      canvasImageDataData[canvasImageDataIndex++] = rgba[0];
      canvasImageDataData[canvasImageDataIndex++] = rgba[1];
      canvasImageDataData[canvasImageDataIndex++] = rgba[2];
      canvasImageDataData[canvasImageDataIndex++] = rgba[3];
    }
  } else {
    while (storedPixelDataIndex < numPixels) {
      //  Find the grayscale of 4 channels image data by calculating relative luminance value
      if (image.color && ((image.width * image.height * 4) === numPixels)) {
        const rValue = pixelData[storedPixelDataIndex++];
        const gValue = pixelData[storedPixelDataIndex++];
        const bValue = pixelData[storedPixelDataIndex++];

        storedPixelDataIndex++; // The pixel data has 4 channels

        const luminance = getRelativeLuminance(rValue, gValue, bValue);

        grayscale = grayscaleLut[luminance];
      } else {
        grayscale = grayscaleLut[pixelData[storedPixelDataIndex++]];
      }
      rgba = clut[grayscale];
      canvasImageDataData[canvasImageDataIndex++] = rgba[0];
      canvasImageDataData[canvasImageDataIndex++] = rgba[1];
      canvasImageDataData[canvasImageDataIndex++] = rgba[2];
      canvasImageDataData[canvasImageDataIndex++] = rgba[3];
    }
  }

  image.stats.lastStoredPixelDataToCanvasImageDataTime = now() - start;
}

/**
 * Calculates the relative luminance value from the RGB component values
 * @param {Number} rValue R component value in RGB
 * @param {Number} gValue G component value in RGB
 * @param {Number} bValue B component value in RGB
 *
 * @returns {Number} The relative luminance value
 */
function getRelativeLuminance (rValue, gValue, bValue) {
  // Calculate relative luminance can be calculated from linear RGB components
  return Math.round(0.2126 * rValue + 0.7152 * gValue + 0.0722 * bValue);
}

export default storedPixelDataToCanvasImageDataPseudocolorLUT;
