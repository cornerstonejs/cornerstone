import triggerEvent from '../triggerEvent.js';
import EVENTS from '../events.js';
import drawImageSync from '../internal/drawImageSync.js';
import getDefaultViewport from '../internal/getDefaultViewport.js';
import tryEnableWebgl from '../internal/tryEnableWebgl.js';

/**
 * @typedef {Object} EnabledElementStub
 * @property {HTMLElement} element  The enabled element
 * @property {HTMLCanvasElement} canvas The current canvas
 * @property {Object} image Currently displayed image
 * @property {Boolean} invalid Whether or not the image pixel data has been changed
 * @property {Boolean} needsRedraw  A flag for triggering a redraw of the canvas without re-retrieving the pixel data, since it remains valid
 * @property {Object} options Layer drawing options
 * @property {Object[]} layers Layers added to the EnabledElement
 * @property {Object} data
 * @property {Object} renderingTools
 * @property {Object} viewport The current viewport
 * @memberof rendering
 */

/**
 * creates a dummy enabled element
 *
 * @param {HTMLCanvasElement} canvas the canvas that will be assigned to the enabled element.
 * @param {any} image An Image loaded by a Cornerstone Image Loader
 * @param { any } options Options for rendering the image (e.g.enable webgl by {renderer: 'webgl' })
 * @param { any } viewport A set of Cornerstone viewport parameters
 * @returns {EnabledElementStub} a dummy enabled element
 * @memberof rendering
 */
function createEnabledElementStub (canvas, image, options, viewport) {
  return {
    element: canvas,
    canvas,
    image,
    invalid: true, // True if image needs to be drawn, false if not
    needsRedraw: true,
    options,
    layers: [],
    data: {},
    renderingTools: {},
    viewport
  };
}

/**
 * Render the image to the provided canvas immediately.
 * @param {any} canvas The HTML canvas where the image will be rendered.
 * @param {any} image An Image loaded by a Cornerstone Image Loader
 * @param {any} [viewport = null] A set of Cornerstone viewport parameters
 * @param {any} [options = null] Options for rendering the image (e.g. enable webgl by {renderer: 'webgl'})
 * @returns {void}
 * @memberof rendering
 */
export default function (canvas, image, viewport = null, options = null) {
  if (canvas === undefined) {
    throw new Error('renderToCanvas: parameter canvas cannot be undefined');
  }

  // If this enabled element has the option set for WebGL, we should
  // Check if this device actually supports it
  if (options && options.renderer && options.renderer.toLowerCase() === 'webgl') {
    tryEnableWebgl(options);
  }

  const defaultViewport = getDefaultViewport(canvas, image);

  if (viewport) {
    Object.assign(defaultViewport, viewport);
  }

  const enabledElementStub = createEnabledElementStub(canvas, image, options, defaultViewport);

  const eventDetails = {
    enabledElement: enabledElementStub,
    timestamp: Date.now()
  };

  triggerEvent(enabledElementStub.element, EVENTS.PRE_RENDER, eventDetails);

  drawImageSync(enabledElementStub, enabledElementStub.invalid);
}
