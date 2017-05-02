import { getEnabledElement } from './enabledElements.js';
import getTransform from './internal/getTransform.js';

/**
 * Converts a point in the canvas coordinate system to the pixel coordinate system
 * system.  This can be used to reset tools' image coordinates after modifications
 * have been made in canvas space (e.g. moving a tool by a few cm, independent of
 * image resolution).
 *
 * @param element
 * @param pt
 * @returns {{x: Number, y: Number}}
 */
export default function (element, pt) {
  const enabledElement = getEnabledElement(element);
  const transform = getTransform(enabledElement);

  transform.invert();

  return transform.transformPoint(pt.x, pt.y);
}
