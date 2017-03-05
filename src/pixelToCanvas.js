import { getTransform } from './internal/getTransform.js';
import { getEnabledElement } from './enabledElements.js';

/**
 * Converts a point in the pixel coordinate system to the canvas coordinate system
 * system.  This can be used to render using canvas context without having the weird
 * side effects that come from scaling and non square pixels
 * @param element
 * @param pt
 * @returns {x: number, y: number}
 */
export function pixelToCanvas(element, pt) {
    var enabledElement = getEnabledElement(element);
    var transform = getTransform(enabledElement);
    return transform.transformPoint(pt.x, pt.y);
}
