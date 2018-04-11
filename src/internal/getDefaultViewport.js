/**
 * Enumeration that describes the displayedArea presentation size mode.
 */
// const DisplayedAreaSizeMode = Object.freeze({
//   NONE: Symbol('NONE'),
//   SCALE_TO_FIT: Symbol('SCALE TO FIT'),
//   TRUE_SIZE: Symbol('TRUE SIZE'),
//   MAGNIFY: Symbol('MAGNIFY')
// });

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

      /**
       * C.10.4 Displayed Area Module: This Module describes Attributes required to define a Specified Displayed Area space.
       */
      displayedArea: {
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
      }
    };
  }

  let verticalRatio = 1;
  let horizontalRatio = 1;

  if (image.rowPixelSpacing < image.columnPixelSpacing) {
    // we believe that the row pixel is the same as css pixel
    horizontalRatio = image.columnPixelSpacing / image.rowPixelSpacing;
  } else {
    // we believe that the column pixel is the same as css pixel
    verticalRatio = image.rowPixelSpacing / image.columnPixelSpacing;
  }

  // Fit image to window
  const verticalScale = canvas.height / image.rows / verticalRatio;
  const horizontalScale = canvas.width / image.columns / horizontalRatio;
  const scale = Math.min(horizontalScale, verticalScale);

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
