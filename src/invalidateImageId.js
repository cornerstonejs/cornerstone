/**
 * This module contains a function to immediately invalidate an image
 */

import { getEnabledElementsByImageId } from './enabledElements.js';
import drawImage from './internal/drawImage.js';

/**
 * Forces the image to be updated/redrawn for the all enabled elements
 * displaying the specified imageId
 *
 * @param {string} imageId The imageId of the Cornerstone Image Object to redraw
 * @returns {void}
 */
export default function (imageId) {

  const enabledElements = getEnabledElementsByImageId(imageId);

  enabledElements.forEach(function (enabledElement) {
    drawImage(enabledElement, true);
  });
}
