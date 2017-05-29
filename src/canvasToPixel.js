import { getEnabledElement } from './enabledElements.js';
import getTransform from './internal/getTransform.js';

/**
 * Converts a point in the canvas coordinate system to the pixel coordinate system
 * system.  This can be used to reset tools' image coordinates after modifications
 * have been made in canvas space (e.g. moving a tool by a few cm, independent of
 * image resolution).
 *
 * @param {HTMLElement} element The Cornerstone element within which the input point lies
 * @param {{x: Number, y: Number}} pt The input point in the canvas coordinate system
 *
 * @returns {{x: Number, y: Number}} The transformed point in the pixel coordinate system
 */
export default function (element, pt) {
  const enabledElement = getEnabledElement(element);
  const transform = getTransform(enabledElement);

  transform.invert();

  return transform.transformPoint(pt.x, pt.y);
}
