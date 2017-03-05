/**
 * This module is responsible for returning the currently displayed image for an element
 */

import { getEnabledElement } from './enabledElements.js';

/**
 * returns the currently displayed image for an element or undefined if no image has
 * been displayed yet
 *
 * @param element
 */
export function getImage(element) {
    var enabledElement = getEnabledElement(element);
    return enabledElement.image;
}
