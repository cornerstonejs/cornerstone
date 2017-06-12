import { render, initRenderer, getRenderCanvas, isWebGLAvailable, isWebGLInitialized } from './renderer.js';
import createProgramFromString from './createProgramFromString.js';
import textureCache from './textureCache.js';

export default {
  createProgramFromString,
  renderer: {
    render,
    initRenderer,
    getRenderCanvas,
    isWebGLAvailable
  },
  textureCache,
  isWebGLInitialized
};
