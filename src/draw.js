/**
 * This module is responsible for immediately drawing an enabled element
 */

import { getEnabledElement } from './enabledElements.js';
import { drawImage } from './internal/drawImage.js';

/**
 * Immediately draws the enabled element
 *
 * @param element
 */
export function draw(element) {
    var enabledElement = getEnabledElement(element);

    if(enabledElement.image === undefined) {
        throw "draw: image has not been loaded yet";
    }

    drawImage(enabledElement);
}
