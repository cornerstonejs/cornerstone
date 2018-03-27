/**
 * Generates a linear modality transformation function
 *
 * See DICOM PS3.3 C.11.1 Modality LUT Module
 *
 * http://dicom.nema.org/medical/Dicom/current/output/chtml/part03/sect_C.11.html
 *
 * @param {Number} slope m in the equation specified by Rescale Intercept (0028,1052).
 * @param {Number} intercept The value b in relationship between stored values (SV) and the output units specified in Rescale Type (0028,1054).

 Output units = m*SV + b.
 * @return {function(*): *} A linear modality LUT function. Given a stored pixel it returns the modality pixel value
 * @memberof Internal
 */
function generateLinearModalityLUT (slope, intercept) {
  return (storedPixelValue) => storedPixelValue * slope + intercept;
}

function generateNonLinearModalityLUT (modalityLUT) {
  const minValue = modalityLUT.lut[0];
  const maxValue = modalityLUT.lut[modalityLUT.lut.length - 1];
  const maxValueMapped = modalityLUT.firstValueMapped + modalityLUT.lut.length;

  return (storedPixelValue) => {
    if (storedPixelValue < modalityLUT.firstValueMapped) {
      return minValue;
    } else if (storedPixelValue >= maxValueMapped) {
      return maxValue;
    }

    return modalityLUT.lut[storedPixelValue];
  };
}

/**
 * Get the appropriate Modality LUT for the current situation.
 *
 * @param {Number} [slope] m in the equation specified by Rescale Intercept (0028,1052).
 * @param {Number} [intercept] The value b in relationship between stored values (SV) and the output units specified in Rescale Type (0028,1054).
 * @param {Function} [modalityLUT] A modality LUT function. Given a stored pixel it returns the modality pixel value.
 *
 * @return {function(*): *} A modality LUT function. Given a stored pixel it returns the modality pixel value.
 * @memberof Internal
 */
export default function (slope, intercept, modalityLUT) {
  if (modalityLUT) {
    return generateNonLinearModalityLUT(modalityLUT);
  }

  return generateLinearModalityLUT(slope, intercept);
}
