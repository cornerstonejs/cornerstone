/**
 * Creates a new viewport object containing default values for the image and canvas
 *
 * @param {HTMLElement} canvas A Canvas DOM element
 * @param {Image} image A Cornerstone Image Object
 * @returns {Viewport} viewport object
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

  // Fit image to window
  const verticalScale = canvas.height / image.rows;
  const horizontalScale = canvas.width / image.columns;
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
