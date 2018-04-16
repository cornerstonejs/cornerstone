import triggerEvent from '../triggerEvent.js';
import EVENTS from '../events.js';
import drawImageSync from '../internal/drawImageSync.js';
import getDefaultViewport from '../internal/getDefaultViewport.js';
import webGL from '../webgl/index.js';


export default function (canvas, image, viewport = null, options = null) {
  if (canvas === undefined) {
    throw new Error('renderToCanvas: parameter canvas cannot be undefined');
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

  const enabledElementStub = {
    element: canvas,
    canvas,
    image,
    invalid: true, // True if image needs to be drawn, false if not
    needsRedraw: true,
    options: null,
    layers: [],
    data: {},
    renderingTools: {},
    viewport: getDefaultViewport(canvas, image)
  };

  // Merge viewport
  if (viewport) {
    for (const attrname in viewport) {
      if (viewport[attrname] !== null) {
        enabledElementStub.viewport[attrname] = viewport[attrname];
      }
    }
  }

  const eventDetails = {
    enabledElement: enabledElementStub,
    timestamp: Date.now()
  };

  triggerEvent(enabledElementStub.element, EVENTS.PRE_RENDER, eventDetails);

  drawImageSync(enabledElementStub, enabledElementStub.invalid);
}
