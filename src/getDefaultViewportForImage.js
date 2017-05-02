/**
 * This file is responsible for returning the default viewport for an image
 */

import { getEnabledElement } from './enabledElements.js';
import getDefaultViewport from './internal/getDefaultViewport.js';

/**
 * Returns a default viewport for display the specified image on the specified
 * enabled element.  The default viewport is fit to window
 *
 * @param element
 * @param image
 */
export default function (element, image) {
  const enabledElement = getEnabledElement(element);

  return getDefaultViewport(enabledElement.canvas, image);
}
