import { getEnabledElement } from './enabledElements.js';
import getDefaultViewport from './internal/getDefaultViewport.js';
import updateImage from './updateImage.js';

/**
 * Resets the viewport to the default settings
 *
 * @param element
 */
export default function (element) {
  const enabledElement = getEnabledElement(element);

  enabledElement.viewport = getDefaultViewport(enabledElement.canvas, enabledElement.image);
  updateImage(element);
}
