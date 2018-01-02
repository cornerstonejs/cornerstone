import getMinMax from './getMinMax.js';
import getStoredValue from './getStoredValue.js';

function hasModalityLUT (viewport) {
  return viewport.modalityLUT && viewport.modalityLUT.lut && viewport.modalityLUT.lut.length > 0;
}

function hasVoiLUT (viewport) {
  return viewport.voiLUT && viewport.voiLUT.lut && viewport.voiLUT.lut.length > 0;
}

/**
 * Calculate the min & max pixel values for an image and setup windows
 *
 * @param {Image} image A Cornerstone Image Object
 * @param {Viewport} image A Cornerstone Viewport Object
 */
export default function (image, viewport) {
  if (image.minPixelValue === undefined || image.maxPixelValue === undefined) {
    const shouldShift = image.pixelRepresentation !== undefined && image.pixelRepresentation === 1;
    const shift = (shouldShift && image.bitsStored !== undefined) ? (32 - image.bitsStored) : undefined;
    let minMax;

    if (shouldShift && shift !== undefined) {
      const pixelData = image.getPixelData();
      minMax = getMinMax(pixelData.map(function(sv, i) { return getStoredValue(i, pixelData, shift); }));
    } else {
      minMax = getMinMax(image.getPixelData());
    }

    image.minPixelValue = minMax.min;
    image.maxPixelValue = minMax.max;


    // const modalityLUT = viewport.modalityLUT;
    // const voiLUT = viewport.voiLUT;
    //
    // if (modalityLUT && !voiLUT) {
    //   const minMax = getMinMax(modalityLUT.lut);
    //   image.minPixelValue = minMax.min;
    //   image.maxPixelValue = minMax.max;
    // } else if (voiLUT) {
    //   const minMax = getMinMax(voiLUT.lut);
    //   image.minPixelValue = minMax.min;
    //   image.maxPixelValue = minMax.max;
    // } else {
    //   image.minPixelValue = image.imageFrame && image.imageFrame.smallestPixelValue;
    //   image.maxPixelValue = image.imageFrame && image.imageFrame.largestPixelValue;
    //
    //   if (image.minPixelValue === undefined || image.maxPixelValue === undefined) {
    //     const minMax = getMinMax(image.getPixelData());
    //     image.minPixelValue = minMax.min;
    //     image.maxPixelValue = minMax.max;
    //   }
    // }
  }

  if (viewport.voi.windowWidth === undefined || viewport.voi.windowCenter === undefined) {
    var min = image.minPixelValue;
    var max = image.maxPixelValue;

    if (!hasVoiLUT(viewport) && hasModalityLUT(viewport)) {
      const minMax = getMinMax(viewport.modalityLUT.lut);
      min = minMax.min;
      max = minMax.max;
      viewport.modalityLUT.minMax = minMax;
      viewport.voi.minMax = minMax;
    } else if (hasModalityLUT(viewport)) {
      const minMax = getMinMax(viewport.modalityLUT.lut);
      min = minMax.min;
      max = minMax.max;
      viewport.modalityLUT.minMax = minMax;
    } else if (hasVoiLUT(viewport)) {
      const minMax = getMinMax(viewport.voiLUT.lut);
      min = minMax.min;
      max = minMax.max;
      viewport.voi.minMax = minMax;
      viewport.voiLUT.minMax = minMax;
    }

    viewport.voi.windowCenter = (min + max + 1) / 2 * image.slope + image.intercept;
    viewport.voi.windowWidth = Math.abs((min + 1 - max) * image.slope);
  }
}
