import { state } from './setDefaultViewport.js';

// eslint-disable-next-line valid-jsdoc
/**
 * Creates the default displayed area.
 * C.10.4 Displayed Area Module: This Module describes Attributes required to define a Specified Displayed Area space.
 *
 * @returns {tlhc: {x,y}, brhc: {x, y},rowPixelSpacing: Number, columnPixelSpacing: Number, presentationSizeMode: Number} displayedArea object
 * @memberof Internal
 */
function createDefaultDisplayedArea () {
  return {
    // Top Left Hand Corner
    tlhc: {
      x: 1,
      y: 1
    },
    // Bottom Right Hand Corner
    brhc: {
      x: 1,
      y: 1
    },
    rowPixelSpacing: 1,
    columnPixelSpacing: 1,
    presentationSizeMode: 'NONE'
  };
}

/**
 * Creates a new viewport object containing default values
 *
 * @returns {Viewport} viewport object
 * @memberof Internal
 */
export default function () {
  const displayedArea = createDefaultDisplayedArea();
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
    displayedArea
  };

  return Object.assign({}, initialDefaultViewport, state.viewport);
}
