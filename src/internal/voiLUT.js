/**
 * This module generates a VOI LUT
 */

(function (cornerstone) {

  "use strict";

  function generateLinearVOILUT(windowWidth, windowCenter) {
    return function(modalityLutValue) {
      return (((modalityLutValue - (windowCenter)) / (windowWidth) + 0.5) * 255.0);
    }
  }

  function generateNonLinearVOILUT(windowWidth, windowCenter, bitsStored, minPixelValue, maxPixelValue, voiLUT) {
    // Shift the stored value based on bitsStored, not always 8 bits
    var shift = voiLUT.numBitsPerEntry - (bitsStored || 8);
    var minValue = voiLUT.lut[0] >> shift;
    var maxValue = voiLUT.lut[voiLUT.lut.length -1] >> shift;
    var maxValueMapped = voiLUT.firstValueMapped + voiLUT.lut.length - 1;
    return function(modalityLutValue) {
      var voiLutValue;
      if(modalityLutValue < voiLUT.firstValueMapped) {
        voiLutValue = minValue;
      }
      else if(modalityLutValue >= maxValueMapped) {
        voiLutValue = maxValue;
      }
      else {
        voiLutValue = voiLUT.lut[modalityLutValue - voiLUT.firstValueMapped] >> shift;
      }

      // Apply the linear conversion from stored pixel values (after any Modality LUT or Rescale Slope and
      // Intercept specified in the IOD have been applied) to the values to be displayed based on Window Width
      // and Window Center
      if (voiLutValue <= windowCenter - 0.5 - (windowWidth-1) / 2) {
        return 0;
      }
      else if (voiLutValue > windowCenter - 0.5 + (windowWidth-1) / 2) {
        return 255;
      }
      else {
        return ((voiLutValue - (windowCenter-0.5)) / (windowWidth-1) + 0.5) * (maxPixelValue-minPixelValue) + minPixelValue;
      }
    }
  }

  function getVOILUT(windowWidth, windowCenter, bitsStored, minPixelValue, maxPixelValue, voiLUT) {
    if(voiLUT) {
      return generateNonLinearVOILUT(windowWidth, windowCenter, bitsStored, minPixelValue, maxPixelValue, voiLUT);
    } else {
      return generateLinearVOILUT(windowWidth, windowCenter);
    }
  }

  // Module exports
  cornerstone.internal.getVOILUT = getVOILUT;
}(cornerstone));
