import { getEnabledElement } from './enabledElements.js';
import getTransform from './internal/getTransform.js';

/**
 * Converts a point in the pixel coordinate system to the canvas coordinate system
 * system.  This can be used to render using canvas context without having the weird
 * side effects that come from scaling and non square pixels
 * @param element
 * @param pt
 * @returns {{x: Number, y: Number}}
 */
export default function (element, pt) {
  const enabledElement = getEnabledElement(element);
  const transform = getTransform(enabledElement);


  return transform.transformPoint(pt.x, pt.y);
}
