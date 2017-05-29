import { getEnabledElement } from './enabledElements.js';
import getStoredPixels from './getStoredPixels.js';
import getModalityLUT from './internal/getModalityLUT.js';

/**
 * Retrieves an array of pixels from a rectangular region with modality LUT transformation applied
 *
 * @param {HTMLElement} element The DOM element enabled for Cornerstone
 * @param {Number} x The x coordinate of the top left corner of the sampling rectangle in image coordinates
 * @param {Number} y The y coordinate of the top left corner of the sampling rectangle in image coordinates
 * @param {Number} width The width of the of the sampling rectangle in image coordinates
 * @param {Number} height The height of the of the sampling rectangle in image coordinates
 * @returns {Array} The modality pixel value of the pixels in the sampling rectangle
 */
export default function (element, x, y, width, height) {
  const storedPixels = getStoredPixels(element, x, y, width, height);
  const ee = getEnabledElement(element);
  const mlutfn = getModalityLUT(ee.image.slope, ee.image.intercept, ee.viewport.modalityLUT);

  return storedPixels.map(mlutfn);
}
