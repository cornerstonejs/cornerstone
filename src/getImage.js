/**
 * This module is responsible for returning the currently displayed image for an element
 */

import { getEnabledElement } from './enabledElements.js';

/**
 * Returns the currently displayed image for an element or undefined if no image has
 * been displayed yet
 *
 * @param element
 */
export default function (element) {
  const enabledElement = getEnabledElement(element);

  return enabledElement.image;
}
