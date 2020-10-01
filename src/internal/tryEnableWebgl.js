import webGL from '../webgl/index.js';

/**
 * Checks if webGL is supported and initializes the rendering engine.
 * @param {any} options Options to check if webgl rendering is requested (e.g. enable webgl by passing {renderer: 'webgl'})
 * @returns {Boolean} true if webgl rendering has been successfully initialized. Otherwise, false.
 */
export default function (options) {
  if (webGL.renderer.isWebGLAvailable()) {
    // If WebGL is available on the device, initialize the renderer
    // And return the renderCanvas from the WebGL rendering path
    webGL.renderer.initRenderer();
    options.renderer = 'webgl';
    options.desynchronized = true;
    options.preserveDrawingBuffer = true;

    return true;
  }

  // If WebGL is not available on this device, we will fall back
  // To using the Canvas renderer
  console.error('WebGL not available, falling back to Canvas renderer');

  delete options.renderer;
  delete options.preserveDrawingBuffer;

  return false;
}
