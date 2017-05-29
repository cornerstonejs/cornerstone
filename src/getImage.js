import { getEnabledElement } from './enabledElements.js';

/**
 * Returns the currently displayed image for an element or undefined if no image has
 * been displayed yet
 *
 * @param {HTMLElement} element The DOM element enabled for Cornerstone
 * @returns {Image} The Cornerstone Image Object displayed in this element
 */
export default function (element) {
  const enabledElement = getEnabledElement(element);

  return enabledElement.image;
}
