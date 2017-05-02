/**
 * This module returns a subset of the stored pixels of an image
 */

import { getEnabledElement } from './enabledElements.js';

/**
 * Returns an array of stored pixels given a rectangle in the image
 * @param element
 * @param x
 * @param y
 * @param width
 * @param height
 * @returns {Array}
 */
export default function (element, x, y, width, height) {
  if (element === undefined) {
    throw 'getStoredPixels: parameter element must not be undefined';
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
