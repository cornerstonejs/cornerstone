import { getEnabledElement } from './enabledElements.js';
import getStoredPixels from './getStoredPixels.js';
import getModalityLUT from './internal/getModalityLUT.js';

/**
 * Returns array of pixels with modality LUT transformation applied
 * @param element
 * @param {Number} x
 * @param {Number} y
 * @param {Number} width
 * @param {Number} height
 * @returns {Array}
 */
export default function (element, x, y, width, height) {
  const storedPixels = getStoredPixels(element, x, y, width, height);
  const ee = getEnabledElement(element);
  const mlutfn = getModalityLUT(ee.image.slope, ee.image.intercept, ee.viewport.modalityLUT);

  return storedPixels.map(mlutfn);
}
