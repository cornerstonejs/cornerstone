/**
 * This module contains a helper function to covert page coordinates to pixel coordinates
 */

import { getEnabledElement } from './enabledElements.js';
import getTransform from './internal/getTransform.js';

/**
 * Converts a point in the page coordinate system to the pixel coordinate
 * system
 * @param element
 * @param pageX
 * @param pageY
 * @returns {{x: number, y: number}}
 */
export default function (element, pageX, pageY) {
  const enabledElement = getEnabledElement(element);

  if (enabledElement.image === undefined) {
    throw 'image has not been loaded yet';
  }

  // Convert the pageX and pageY to the canvas client coordinates
  const rect = element.getBoundingClientRect();
  const clientX = pageX - rect.left - window.pageXOffset;
  const clientY = pageY - rect.top - window.pageYOffset;

  const pt = { x: clientX,
    y: clientY };
  const transform = getTransform(enabledElement);

  transform.invert();

  return transform.transformPoint(pt.x, pt.y);
}
