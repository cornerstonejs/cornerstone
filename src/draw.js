import { getEnabledElement } from './enabledElements.js';
import drawImage from './internal/drawImage.js';

/**
 * Immediately draws the enabled element
 *
 * @param {HTMLElement} element An HTML Element enabled for Cornerstone
 * @returns {void}
 * @memberof Drawing
 */
export default function (element) {
  const enabledElement = getEnabledElement(element);

  drawImage(enabledElement);
}
