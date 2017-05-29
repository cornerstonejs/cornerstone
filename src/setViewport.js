/**
 * This module contains functions to deal with getting and setting the viewport for an enabled element
 */

import { getEnabledElement } from './enabledElements.js';
import updateImage from './updateImage.js';

const MIN_WINDOW_WIDTH = 0.000001;
const MIN_VIEWPORT_SCALE = 0.0001;

/**
 * Sets the viewport for an element and corrects invalid values
 *
 * @param {HTMLElement} element - DOM element of the enabled element
 * @param {Viewport} viewport - Object containing the viewport properties
 * @returns {void}
 */
export default function (element, viewport) {

  const enabledElement = getEnabledElement(element);

  enabledElement.viewport.scale = viewport.scale;
  enabledElement.viewport.translation.x = viewport.translation.x;
  enabledElement.viewport.translation.y = viewport.translation.y;
  enabledElement.viewport.voi.windowWidth = viewport.voi.windowWidth;
  enabledElement.viewport.voi.windowCenter = viewport.voi.windowCenter;
  enabledElement.viewport.invert = viewport.invert;
  enabledElement.viewport.pixelReplication = viewport.pixelReplication;
  enabledElement.viewport.rotation = viewport.rotation;
  enabledElement.viewport.hflip = viewport.hflip;
  enabledElement.viewport.vflip = viewport.vflip;
  enabledElement.viewport.modalityLUT = viewport.modalityLUT;
  enabledElement.viewport.voiLUT = viewport.voiLUT;

  // Prevent window width from being too small (note that values close to zero are valid and can occur with
  // PET images in particular)
  enabledElement.viewport.voi.windowWidth = Math.max(enabledElement.viewport.voi.windowWidth, MIN_WINDOW_WIDTH);

  // Prevent scale from getting too small
  enabledElement.viewport.scale = Math.max(enabledElement.viewport.scale, MIN_VIEWPORT_SCALE);

  // Normalize the rotation value to a positive rotation in degrees
  enabledElement.viewport.rotation %= 360;
  if (enabledElement.viewport.rotation < 0) {
    enabledElement.viewport.rotation += 360;
  }

  // Force the image to be updated since the viewport has been modified
  updateImage(element);
}
