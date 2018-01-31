import { render, initRenderer, getRenderCanvas, isWebGLAvailable, isWebGLInitialized } from './renderer.js';
import createProgramFromString from './createProgramFromString.js';
import textureCache from './textureCache.js';

/**
 * @module WebGLRendering
 */

const mod = {
  createProgramFromString,
  renderer: {
    render,
    initRenderer,
    getRenderCanvas,
    isWebGLAvailable
  },
  textureCache
};

Object.defineProperty(mod, 'isWebGLInitialized', {
  enumerable: true,
  configurable: false,
  get: () => isWebGLInitialized
});

export default mod;
