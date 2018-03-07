import { getEnabledElement } from './enabledElements.js';
import triggerEvent from './triggerEvent.js';
import EVENTS from './events.js';

/**
 * Sets the invalid flag on the enabled element and fire an event
 * @param {HTMLElement} element The DOM element enabled for Cornerstone
 * @returns {void}
 * @memberof Drawing
 */
export default function (element) {
  const enabledElement = getEnabledElement(element);

  enabledElement.invalid = true;
  enabledElement.needsRedraw = true;
  const eventData = {
    element
  };

  triggerEvent(element, EVENTS.INVALIDATED, eventData);
}
