import { getEnabledElement } from './enabledElements.js';

/**
 * Retrieves an array of stored pixel values from a rectangular region of an image
 *
 * @param {HTMLElement} element The DOM element enabled for Cornerstone
 * @param {Number} x The x coordinate of the top left corner of the sampling rectangle in image coordinates
 * @param {Number} y The y coordinate of the top left corner of the sampling rectangle in image coordinates
 * @param {Number} width The width of the of the sampling rectangle in image coordinates
 * @param {Number} height The height of the of the sampling rectangle in image coordinates
 * @returns {Array} The stored pixel value of the pixels in the sampling rectangle
 */
export default function (element, x, y, width, height) {
  if (element === undefined) {
    throw new Error('getStoredPixels: parameter element must not be undefined');
  }

  x = Math.round(x);
  y = Math.round(y);
  const enabledElement = getEnabledElement(element);
  const storedPixels = [];
  let index = 0;
  const pixelData = enabledElement.image.getPixelData();

  for (let row = 0; row < height; row++) {
    for (let column = 0; column < width; column++) {
      const spIndex = ((row + y) * enabledElement.image.columns) + (column + x);

      storedPixels[index++] = pixelData[spIndex];
    }
  }

  return storedPixels;
}
