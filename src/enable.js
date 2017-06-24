/**
 * This module is responsible for enabling an element to display images with cornerstone
 */

import { addEnabledElement } from './enabledElements.js';
import resize from './resize.js';
import drawImageSync from './internal/drawImageSync.js';
import requestAnimationFrame from './internal/requestAnimationFrame.js';
import webGL from './webgl/index.js';

function hasImageOrLayers (enabledElement) {
  return enabledElement.image !== undefined || enabledElement.layers.length;
}


/**
 * Enable an HTML Element for use in Cornerstone
 *
 * @param {HTMLElement} element An HTML Element enabled for Cornerstone
 * @param {Object} options Options for the enabledElement
 *
 * @return {void}
 */
export default function (element, options) {
  if (element === undefined) {
    throw new Error('enable: parameter element cannot be undefined');
  }

  // If this enabled element has the option set for WebGL, we should
  // Check if this device actually supports it
  if (options && options.renderer && options.renderer.toLowerCase() === 'webgl') {
    if (webGL.renderer.isWebGLAvailable()) {
      // If WebGL is available on the device, initialize the renderer
      // And return the renderCanvas from the WebGL rendering path
      webGL.renderer.initRenderer();
      options.renderer = 'webgl';
    } else {
      // If WebGL is not available on this device, we will fall back
      // To using the Canvas renderer
      console.error('WebGL not available, falling back to Canvas renderer');
      delete options.renderer;
    }
  }

  const canvas = document.createElement('canvas');

  element.appendChild(canvas);

  const enabledElement = {
    element,
    canvas,
    image: undefined, // Will be set once image is loaded
    invalid: false, // True if image needs to be drawn, false if not
    needsRedraw: true,
    options,
    layers: [],
    data: {},
    renderingTools: {}
  };

  addEnabledElement(enabledElement);

  resize(element, true);

  /**
   * Draw the image immediately
   *
   * @param {DOMHighResTimeStamp} timestamp The current time for when requestAnimationFrame starts to fire callbacks
   * @returns {void}
   */
  function draw (timestamp) {
    if (enabledElement.canvas === undefined) {
      return;
    }

    $(enabledElement.element).trigger('CornerstonePreRender', {
      enabledElement,
      timestamp
    });

    if (enabledElement.needsRedraw && hasImageOrLayers(enabledElement)) {
      drawImageSync(enabledElement, enabledElement.invalid);
    }

    requestAnimationFrame(draw);
  }

  draw();
}
