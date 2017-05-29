import { getEnabledElement } from './enabledElements.js';
import getTransform from './internal/getTransform.js';

/**
 * Converts a point in the pixel coordinate system to the canvas coordinate system
 * system.  This can be used to render using canvas context without having the weird
 * side effects that come from scaling and non square pixels
 *
 * @param {HTMLElement} element An HTML Element enabled for Cornerstone
 * @param {{x: Number, y: Number}} pt The transformed point in the pixel coordinate system
 *
 * @returns {{x: Number, y: Number}} The input point in the canvas coordinate system
 */
export default function (element, pt) {
  const enabledElement = getEnabledElement(element);
  const transform = getTransform(enabledElement);


  return transform.transformPoint(pt.x, pt.y);
}
