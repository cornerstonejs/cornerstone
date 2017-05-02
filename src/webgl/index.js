import { render, initRenderer, getRenderCanvas, isWebGLAvailable, isWebGLInitialized } from './renderer';
import createProgramFromString from './createProgramFromString';
import textureCache from './textureCache';

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
