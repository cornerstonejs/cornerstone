/**
 * This module contains a function to immediately invalidate an image
 */

import { getEnabledElementsByImageId } from './enabledElements.js';
import drawImage from './internal/drawImage.js';

/**
 * Forces the image to be updated/redrawn for the all enabled elements
 * displaying the specified imageId
 *
 * @param imageId
 */
export default function (imageId) {

  const enabledElements = getEnabledElementsByImageId(imageId);

  enabledElements.forEach(function (enabledElement) {
    drawImage(enabledElement, true);
  });
}
