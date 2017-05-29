import { getEnabledElement } from './enabledElements.js';
import getTransform from './internal/getTransform.js';

/**
 * Converts a point in the page coordinate system to the pixel coordinate
 * system
 *
 * @param {HTMLElement} element The Cornerstone element within which the input point lies
 * @param {Number} pageX The x value in the page coordinate system
 * @param {Number} pageY The y value in the page coordinate system
 *
 * @returns {{x: Number, y: Number}} The transformed point in the pixel coordinate system
 */
export default function (element, pageX, pageY) {
  const enabledElement = getEnabledElement(element);

  if (enabledElement.image === undefined) {
    throw new Error('image has not been loaded yet');
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
