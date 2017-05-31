/**
 * This module generates a Modality LUT
 */

function generateLinearModalityLUT (slope, intercept) {
  const localSlope = slope;
  const localIntercept = intercept;


  return function (sp) {
    return sp * localSlope + localIntercept;
  };
}

function generateNonLinearModalityLUT (modalityLUT) {
  const minValue = modalityLUT.lut[0];
  const maxValue = modalityLUT.lut[modalityLUT.lut.length - 1];
  const maxValueMapped = modalityLUT.firstValueMapped + modalityLUT.lut.length;


  return function (sp) {
    if (sp < modalityLUT.firstValueMapped) {
      return minValue;
    } else if (sp >= maxValueMapped) {
      return maxValue;
    }

    return modalityLUT.lut[sp];
  };
}

export default function (slope, intercept, modalityLUT) {
  if (modalityLUT) {
    return generateNonLinearModalityLUT(modalityLUT);
  }

  return generateLinearModalityLUT(slope, intercept);

}
