/**
 * This module generates a Modality LUT
 */

function generateLinearModalityLUT(slope, intercept) {
  var localSlope = slope;
  var localIntercept = intercept;
  return function(sp) {
    return sp * localSlope + localIntercept;
  }
}

function generateNonLinearModalityLUT(modalityLUT) {
  var minValue = modalityLUT.lut[0];
  var maxValue = modalityLUT.lut[modalityLUT.lut.length -1];
  var maxValueMapped = modalityLUT.firstValueMapped + modalityLUT.lut.length;
  return function(sp) {
    if(sp < modalityLUT.firstValueMapped) {
      return minValue;
    }
    else if(sp >= maxValueMapped)
    {
      return maxValue;
    }
    else
    {
      return modalityLUT.lut[sp];
    }
  }
}

export function getModalityLUT(slope, intercept, modalityLUT) {
  if (modalityLUT) {
    return generateNonLinearModalityLUT(modalityLUT);
  } else {
    return generateLinearModalityLUT(slope, intercept);
  }
}
