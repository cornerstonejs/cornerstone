import createViewport from './createViewport.js';
import getImageFitScale from './getImageFitScale.js';

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
      rowPixelSpacing: image.rowPixelSpacing === undefined ? 1 : image.rowPixelSpacing,
      columnPixelSpacing: image.columnPixelSpacing === undefined ? 1 : image.columnPixelSpacing,
      presentationSizeMode: 'NONE'
    }
  };
}
