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
      /* C.10.4 Displayed Area Module
      * This Module describes Attributes required to define a Specified Displayed Area space.
      *
      * The Specified Displayed Area is that portion of the image displayed on the device.
      *
      * If Presentation Size Mode (0070,0100) is specified as SCALE TO FIT, then the specified area shall be displayed as large as possible within the available area on the display or window, i.e., magnified or minified if necessary to fit the display or window space available.
      *
      * If Presentation Size Mode (0070,0100) is specified as TRUE SIZE, then the physical size of the rendered image pixels shall be the same on the screen as specified in Presentation Pixel Spacing (0070,0101).
      *
      * If Presentation Size Mode (0070,0100) is specified as MAGNIFY, then the factor that shall be used to spatially interpolate image pixels to create pixels on the display is defined.
      *
      * - In scale to fit mode, the Displayed Area Top Left Hand Corner (TLHC) and Bottom Right Hand Corner (BRHC)
      * have the effect of defining how any zoom or magnification and/or pan has been applied to select a region of an image to be displayed (the Specified Displayed Area),
      * without assuming anything about the size of the actual display.
      *
      * - The TLHC and BRHC may be outside the boundaries of the image pixel data (e.g., the TLHC may be 0 or negative, or the BRHC may be greater than Rows or Columns),
      * allowing minification or placement of the image pixel data within a larger Specified Displayed Area.
      * There is no provision to position a zoomed selected sub-area of the image pixel data within a larger Specified Displayed Area.
      *
      * - When Pixel Origin Interpretation (0048,0301) value is VOLUME, the selected Display Area may extend across multiple frames,
      * and may include pixel locations for which there is no pixel data (outside the edge of the imaged volume, not encoded in a sparse encoding, or not within explicitly selected frames).
      * http://dicom.nema.org/medical/Dicom/2016b/output/chtml/part03/sect_C.10.4.html
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
        presentationSizeMode: 'SCALE TO FIT'
      }
    };
  }

  /**
  * Enumeration that describes the displayedArea presentation size mode.
  */
  // TODO: Causing build error in the examples
  // const presentationSizeModes = { scaleToFit: "SCALE TO FIT", trueSize: "TRUE SIZE", magnify: "MAGNIFY" };

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
    labelmap: Boolean(image.labelmap),
    displayedArea: {
      tlhc: {
        x: 1,
        y: 1
      },
      brhc: {
        x: image.columns + 1,
        y: image.rows + 1
      },
      rowPixelSpacing: image.rowPixelSpacing !== undefined ? image.rowPixelSpacing : 1,
      columnPixelSpacing: image.columnPixelSpacing !== undefined ? image.columnPixelSpacing : 1,
      presentationSizeMode: 'SCALE TO FIT'
    }
  };
}
