/**
 * This module is responsible for immediately drawing an enabled element
 */

import { getEnabledElement } from './enabledElements.js';
import drawImage from './internal/drawImage.js';

/**
 * Immediately draws the enabled element
 *
 * @param {HTMLElement} element An HTML Element enabled for Cornerstone
 * @returns {void}
 */
export default function (element) {
  const enabledElement = getEnabledElement(element);

  if (enabledElement.image === undefined) {
    throw new Error('draw: image has not been loaded yet');
  }

  drawImage(enabledElement);
}
