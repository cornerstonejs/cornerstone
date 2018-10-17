import getImageFitScale from './getImageFitScale.js';


/**
 * Creates a new viewport object containing default values
 *
 * @returns {Viewport} viewport object
 * @memberof Internal
 */
function createViewport () {
  const displayedArea = createDefaultDisplayedArea();

  return {
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
}


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
 * Creates a new viewport object containing default values for the image and canvas
 *
 * @param {HTMLElement} canvas A Canvas DOM element
 * @param {Image} image A Cornerstone Image Object
 * @returns {Viewport} viewport object
 * @memberof Internal
 */
export default function (canvas, image) {
  if (canvas === undefined) {
    throw new Error('getDefaultViewport: parameter canvas must not be undefined');
  }

  if (image === undefined) {
    return createViewport();
  }

  // Fit image to window
  const scale = getImageFitScale(canvas, image, 0).scaleFactor;

  return {
    scale,
    translation: {
      x: 0,
      y: 0
    },
    voi: {
      windowWidth: image.windowWidth,
      windowCenter: image.windowCenter
    },
    invert: image.invert,
    pixelReplication: false,
    rotation: 0,
    hflip: false,
    vflip: false,
    modalityLUT: image.modalityLUT,
    voiLUT: image.voiLUT,
    colormap: image.colormap,
    labelmap: Boolean(image.labelmap),
    displayedArea: {
      tlhc: {
        x: 1,
        y: 1
      },
      brhc: {
        x: image.columns,
        y: image.rows
      },
      rowPixelSpacing: image.rowPixelSpacing === undefined || image.rowPixelSpacing === null ? 1 : image.rowPixelSpacing,
      columnPixelSpacing: image.columnPixelSpacing === undefined || image.columnPixelSpacing === null ? 1 : image.columnPixelSpacing,
      presentationSizeMode: 'NONE'
    }
  };
}
