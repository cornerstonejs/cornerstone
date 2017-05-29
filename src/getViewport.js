import { getEnabledElement } from './enabledElements.js';

/**
 * Retrieves the viewport for the specified enabled element
 *
 * @param {HTMLElement} element The DOM element enabled for Cornerstone
 * @returns {Viewport|undefined} The Cornerstone Viewport settings for this element, if they exist. Otherwise, undefined
 */
export default function (element) {
  const enabledElement = getEnabledElement(element);

  const viewport = enabledElement.viewport;

  if (viewport === undefined) {
    return;
  }

  return {
    scale: viewport.scale,
    translation: {
      x: viewport.translation.x,
      y: viewport.translation.y
    },
    voi: {
      windowWidth: viewport.voi.windowWidth,
      windowCenter: viewport.voi.windowCenter
    },
    invert: viewport.invert,
    pixelReplication: viewport.pixelReplication,
    rotation: viewport.rotation,
    hflip: viewport.hflip,
    vflip: viewport.vflip,
    modalityLUT: viewport.modalityLUT,
    voiLUT: viewport.voiLUT
  };
}
