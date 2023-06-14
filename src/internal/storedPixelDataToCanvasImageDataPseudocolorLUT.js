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

  const grayscalePixelByDefault = () => {
    return pixelData[storedPixelDataIndex++];
  };
  const grayscalePixelByLuminosityMethod = () => {
    const r = pixelData[storedPixelDataIndex++];
    const g = pixelData[storedPixelDataIndex++];
    const b = pixelData[storedPixelDataIndex++];
    storedPixelDataIndex++;//skip alpha channel
    return Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  };
  const grayscalePixel = image.color
    ? grayscalePixelByLuminosityMethod
    : grayscalePixelByDefault;

  if (minPixelValue < 0) {
    while (storedPixelDataIndex < numPixels) {
      grayscale = grayscaleLut[grayscalePixel() - minPixelValue];
      rgba = clut[grayscale];
      canvasImageDataData[canvasImageDataIndex++] = rgba[0];
      canvasImageDataData[canvasImageDataIndex++] = rgba[1];
      canvasImageDataData[canvasImageDataIndex++] = rgba[2];
      canvasImageDataData[canvasImageDataIndex++] = rgba[3];
    }
  } else {
    while (storedPixelDataIndex < numPixels) {
      grayscale = grayscaleLut[grayscalePixel()];
      rgba = clut[grayscale];
      canvasImageDataData[canvasImageDataIndex++] = rgba[0];
      canvasImageDataData[canvasImageDataIndex++] = rgba[1];
      canvasImageDataData[canvasImageDataIndex++] = rgba[2];
      canvasImageDataData[canvasImageDataIndex++] = rgba[3];
    }
  }

  image.stats.lastStoredPixelDataToCanvasImageDataTime = now() - start;
}

export default storedPixelDataToCanvasImageDataPseudocolorLUT;
