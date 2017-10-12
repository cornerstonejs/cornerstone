import { getEnabledElement } from './enabledElements.js';
import triggerEvent from './triggerEvent.js';

/**
 * This module contains a function to make an image is invalid
 */

/**
 * Sets the invalid flag on the enabled element and fire an event
 * @param {HTMLElement} element The DOM element enabled for Cornerstone
 * @returns {void}
 */
export default function (element) {
  const enabledElement = getEnabledElement(element);

  enabledElement.invalid = true;
  enabledElement.needsRedraw = true;
  const eventData = {
    element
  };

  triggerEvent(element, 'cornerstoneinvalidated', eventData);
}
