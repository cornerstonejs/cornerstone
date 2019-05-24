import { addEnabledElement } from './enabledElements.js';
import resize from './resize.js';
import tryEnableWebgl from './internal/tryEnableWebgl.js';
import triggerEvent from './triggerEvent.js';
import generateUUID from './generateUUID.js';
import EVENTS, { events } from './events.js';
import getCanvas from './internal/getCanvas.js';

/**
 * @module Enable
 * This module is responsible for enabling an element to display images with cornerstone
 */

/**
 * Enable an HTML Element for use in Cornerstone
 *
 * - If there is a Canvas already present within the HTMLElement, and it has the class
 * 'cornerstone-canvas', this function will use this existing Canvas instead of creating
 * a new one. This may be helpful when using libraries (e.g. React, Vue) which don't
 * want third parties to change the DOM.
 *
 * @param {HTMLElement} element An HTML Element enabled for Cornerstone
 * @param {Object} options Options for the enabledElement
 *
 * @return {void}
 * @memberof Enable
 */
export default function (element, options) {
  if (element === undefined) {
    throw new Error('enable: parameter element cannot be undefined');
  }

  // If this enabled element has the option set for WebGL, we should
  // Check if this device actually supports it
  if (
    options &&
    options.renderer &&
    options.renderer.toLowerCase() === 'webgl'
  ) {
    tryEnableWebgl(options);
  }

  const canvas = getCanvas(element);

  const enabledElement = {
    element,
    canvas,
    image: undefined, // Will be set once image is loaded
    invalid: false, // True if image needs to be drawn, false if not
    options,
    layers: [],
    data: {},
    renderingTools: {},
    uuid: generateUUID()
  };

  addEnabledElement(enabledElement);

  triggerEvent(events, EVENTS.ELEMENT_ENABLED, enabledElement);

  resize(element, true);
}
