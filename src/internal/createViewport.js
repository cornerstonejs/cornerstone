import { state } from './setDefaultViewport.js';

/**
 * Creates a new viewport object containing default values
 *
 * @returns {Viewport} viewport object
 * @memberof Internal
 */
export default function () {
  const initialDefaultViewport = {
    scale: 1,
    translation: {
      x: 0,
      y: 0
    },
    voi: {
      windowWidth: undefined,
      windowCenter: undefined
    },
    invert: false,
    pixelReplication: false,
    rotation: 0,
    hflip: false,
    vflip: false,
    modalityLUT: undefined,
    voiLUT: undefined,
    colormap: undefined,
    labelmap: false,
    displayedArea: undefined
  };

  return Object.assign({}, initialDefaultViewport, state.viewport);
}
