import getModalityLUT from './getModalityLUT.js';
import getVOILUT from './getVOILut.js';

/**
 * Creates a LUT used while rendering to convert stored pixel values to
 * display pixels
 *
 * @param {Image} image A Cornerstone Image Object
 * @param {Number} windowWidth The Window Width
 * @param {Number} windowCenter The Window Center
 * @param {Boolean} invert A boolean describing whether or not the image has been inverted
 * @param {Array} [modalityLUT] A modality Lookup Table
 * @param {Array} [voiLUT] A Volume of Interest Lookup Table
 *
 * @returns {Uint8ClampedArray} A lookup table to apply to the image
 * @memberof Internal
 */
export default function (image, windowWidth, windowCenter, invert, modalityLUT, voiLUT) {
  const maxPixelValue = image.maxPixelValue;
  const minPixelValue = image.minPixelValue;
  const offset = Math.min(minPixelValue, 0);

  if (image.cachedLut === undefined) {
    const length = maxPixelValue - offset + 1;

    image.cachedLut = {};
    image.cachedLut.lutArray = new Uint8ClampedArray(length);
  }

  const lut = image.cachedLut.lutArray;
  const mlutfn = getModalityLUT(image.slope, image.intercept, modalityLUT);
  let vlutfn;

  if (image.windowWidth === windowWidth && image.windowCenter === windowCenter) {
    vlutfn = getVOILUT(windowWidth, windowCenter, voiLUT);
  } else {
    vlutfn = getVOILUT(windowWidth, windowCenter);
  }

  if (invert === true) {
    for (let storedValue = minPixelValue; storedValue <= maxPixelValue; storedValue++) {
      lut[storedValue + (-offset)] = 255 - vlutfn(mlutfn(storedValue));
    }
  } else {
    for (let storedValue = minPixelValue; storedValue <= maxPixelValue; storedValue++) {
      lut[storedValue + (-offset)] = vlutfn(mlutfn(storedValue));
    }
  }

  return lut;
}
