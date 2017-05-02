import getModalityLUT from './getModalityLUT.js';
import getVOILUT from './getVOILut.js';

/**
 * Creates a LUT used while rendering to convert stored pixel values to
 * display pixels
 *
 * @param image
 * @param windowWidth
 * @param windowCenter
 * @param invert
 * @param modalityLUT
 * @param voiLUT
 * @returns {Uint8ClampedArray}
 */
export default function (image, windowWidth, windowCenter, invert, modalityLUT, voiLUT) {
  if (image.cachedLut === undefined) {
    const length = image.maxPixelValue - Math.min(image.minPixelValue, 0) + 1;

    image.cachedLut = {};
    image.cachedLut.lutArray = new Uint8ClampedArray(length);
  }
  const lut = image.cachedLut.lutArray;
  const maxPixelValue = image.maxPixelValue;
  const minPixelValue = image.minPixelValue;

  const mlutfn = getModalityLUT(image.slope, image.intercept, modalityLUT);
  const vlutfn = getVOILUT(windowWidth, windowCenter, voiLUT);

  let offset = 0;

  if (minPixelValue < 0) {
    offset = minPixelValue;
  }

  if (invert === true) {
    for (let storedValue = image.minPixelValue; storedValue <= maxPixelValue; storedValue++) {
      lut[storedValue + (-offset)] = 255 - vlutfn(mlutfn(storedValue));
    }
  } else {
    for (let storedValue = image.minPixelValue; storedValue <= maxPixelValue; storedValue++) {
      lut[storedValue + (-offset)] = vlutfn(mlutfn(storedValue));
    }
  }

  return lut;
}
