import { getEnabledElement } from './enabledElements.js';
import drawImage from './internal/drawImage.js';

/**
 * This module contains a function to immediately redraw an image
 */
/**
 * Forces the image to be updated/redrawn for the specified enabled element
 * @param element
 * @param invalidated
 */
export default function (element, invalidated) {
  const enabledElement = getEnabledElement(element);

  if (enabledElement.image === undefined) {
    throw 'updateImage: image has not been loaded yet';
  }

  drawImage(enabledElement, invalidated);
}
