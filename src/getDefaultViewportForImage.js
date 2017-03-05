/**
 * This file is responsible for returning the default viewport for an image
 */

import { getEnabledElement } from './enabledElements.js';
import { getDefaultViewport } from './internal/getDefaultViewport.js';

/**
 * returns a default viewport for display the specified image on the specified
 * enabled element.  The default viewport is fit to window
 *
 * @param element
 * @param image
 */
export function getDefaultViewportForImage(element, image) {
    var enabledElement = getEnabledElement(element);
    var viewport = getDefaultViewport(enabledElement.canvas, image);
    return viewport;
}
