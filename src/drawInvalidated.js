/**
 * This module is responsible for drawing invalidated enabled elements
 */

import { getEnabledElements } from './enabledElements.js';
import drawImage from './internal/drawImage.js';

/**
 * Draws all invalidated enabled elements and clears the invalid flag after drawing it
 *
 * @returns {void}
 */
export default function () {
  const enabledElements = getEnabledElements();

  for (let i = 0; i < enabledElements.length; i++) {
    const ee = enabledElements[i];

    if (ee.invalid === true) {
      drawImage(ee, true);
    }
  }
}
