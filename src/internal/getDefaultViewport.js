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
      labelmap: false
    };
  }

  let verticalRatio = 1;
  let horizontalRatio = 1;

  if (image.rowPixelSpacing < image.columnPixelSpacing) {
   //we believe that the row pixel is the same as css pixel 
   horizontalRatio = image.columnPixelSpacing / image.rowPixelSpacing;
  } else {
   //we believe that the column pixel is the same as css pixel
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
    labelmap: Boolean(image.labelmap)
  };
}
