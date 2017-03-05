/**
 * This module generates a VOI LUT
 */

function generateLinearVOILUT(windowWidth, windowCenter) {
  return function(modalityLutValue) {
    return (((modalityLutValue - (windowCenter)) / (windowWidth) + 0.5) * 255.0);
  }
}

function generateNonLinearVOILUT(voiLUT) {
  var shift = voiLUT.numBitsPerEntry - 8;
  var minValue = voiLUT.lut[0] >> shift;
  var maxValue = voiLUT.lut[voiLUT.lut.length -1] >> shift;
  var maxValueMapped = voiLUT.firstValueMapped + voiLUT.lut.length - 1;
  return function(modalityLutValue) {
    if(modalityLutValue < voiLUT.firstValueMapped) {
      return minValue;
    }
    else if(modalityLutValue >= maxValueMapped)
    {
      return maxValue;
    }
    else
    {
      return voiLUT.lut[modalityLutValue - voiLUT.firstValueMapped] >> shift;
    }
  }
}

export function getVOILUT(windowWidth, windowCenter, voiLUT) {
  if(voiLUT) {
    return generateNonLinearVOILUT(voiLUT);
  } else {
    return generateLinearVOILUT(windowWidth, windowCenter);
  }
}
