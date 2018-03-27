import getModalityLUT from './getModalityLUT.js';
import getVOILUT from './getVOILut.js';
import autoWindow from './autoWindow.js';

/**
 * Creates a LUT used while rendering to convert stored pixel values to
 * display pixels
 *
 * @param {image} image A Cornerstone Image Object
 * @param {viewport} image A Cornerstone Viewport Object
 *
 * Properties that may be used:
 * @param {Number} windowWidth The Window Width
 * @param {Number} windowCenter The Window Center
 * @param {Boolean} invert A boolean describing whether or not the image has been inverted
 * @param {Array} [modalityLUT] A modality Lookup Table
 * @param {Array} [voiLUT] A Volume of Interest Lookup Table
 *
 * @returns {Uint8ClampedArray} A lookup table to apply to the image
 * @memberof Internal
 */
export default function (image, viewport) {
  //Auto window
  autoWindow(image, viewport);

  const modalityLUT = viewport.modalityLUT;
  const voiLUT = viewport.voiLUT;
  const windowWidth = viewport.voi.windowWidth;
  const windowCenter = viewport.voi.windowCenter;
  const invert = viewport.invert || image.photometricInterpretation === 'MONOCHROME1';

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
  const vlutfn = getVOILUT(windowWidth, windowCenter, voiLUT);

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
