import { getEnabledElement } from './enabledElements.js';

/**
 * Retrieves the viewport for the specified enabled element
 *
 * @param {HTMLElement} element The DOM element enabled for Cornerstone
 * @returns {Viewport|undefined} The Cornerstone Viewport settings for this element, if they exist. Otherwise, undefined
 * @memberof ViewportSettings
 */
export default function (element) {
  const enabledElement = getEnabledElement(element);
  const viewport = enabledElement.viewport;

  if (viewport === undefined) {
    return;
  }

  // Return a copy of the viewport
  return Object.assign({}, viewport);
}
