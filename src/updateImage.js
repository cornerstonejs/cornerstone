import { getEnabledElement } from './enabledElements.js';
import { drawImage } from './internal/drawImage.js';

/**
 * Forces the image to be updated/redrawn for the specified enabled element
 * @param {HTMLElement} element An HTML Element enabled for Cornerstone
 * @param {Boolean} [invalidated=false] Whether or not the image pixel data has been changed, necessitating a redraw
 *
 * @returns {void}
 * @memberof Drawing
 */
export default function (element, invalidated = false) {
  const enabledElement = getEnabledElement(element);

  if (enabledElement.image === undefined && !enabledElement.layers.length) {
    throw new Error('updateImage: image has not been loaded yet');
  }

  drawImage(enabledElement, invalidated);
}
