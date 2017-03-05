/**
 * This module contains a function to make an image is invalid
 */

import { getEnabledElement } from './enabledElements.js';

/**
 * Sets the invalid flag on the enabled element and fire an event
 * @param element
 */
export function invalidate(element) {
    var enabledElement = getEnabledElement(element);
    enabledElement.invalid = true;
    enabledElement.needsRedraw = true;
    var eventData = {
        element: element
    };
    var event = new CustomEvent("CornerstoneInvalidated", {detail: eventData});
    enabledElement.element.dispatchEvent(event);
}
