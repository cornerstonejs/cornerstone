const enabledElements = [];

/**
 * A two-dimensional vector
 *
 * @typedef {Object} vec2
 * @param {Number} x - The x distance
 * @param {Number} y - The y distance
 */

/**
 * VOI
 *
 * @typedef {Object} VOI
 * @param {Number} windowWidth - Window Width for display
 * @param {Number} windowCenter - Window Center for display
 */

/**
 * Lookup Table Array
 *
 * @typedef {Object} LUT
 * @property {Number} firstValueMapped
 * @property {Number} numBitsPerEntry
 * @property {Array} lut
 */

/**
 * Image Statistics Object
 *
 * @typedef {Object} ImageStats
 *
 * @property {Number} [lastGetPixelDataTime] The time in ms taken to retrieve stored pixels required to draw the image
 * @property {Number} [lastStoredPixelDataToCanvasImageDataTime] The time in ms taken to map from stored pixel array to canvas pixel array
 * @property {Number} [lastPutImageDataTime] The time in ms taken for putImageData to put the canvas pixel data into the canvas context
 * @property {Number} [lastRenderTime] The total time in ms taken for the entire rendering function to run
 * @property {Number} [lastLutGenerateTime] The time in ms taken to generate the lookup table for the image
 */

/**
 * An Image Object in Cornerstone
 *
 * @typedef {Object} Image
 *
 * @property {string} imageId - The imageId associated with this image object
 * @property {Number} minPixelValue - the minimum stored pixel value in the image
 * @property {Number} maxPixelValue - the maximum stored pixel value in the image
 * @property {Number} slope - the rescale slope to convert stored pixel values to modality pixel values or 1 if not specified
 * @property {Number} intercept - the rescale intercept used to convert stored pixel values to modality values or 0 if not specified
 * @property {Number} windowCenter - the default windowCenter to apply to the image
 * @property {Number} windowWidth - the default windowWidth to apply to the image
 * @property {function} getPixelData - a function that returns the underlying pixel data. An array of integers for grayscale and an array of RGBA for color
 * @property {function} getImageData - a function that returns a canvas imageData object for the image. This is only needed for color images
 * @property {function} getCanvas - a function that returns a canvas element with the image loaded into it. This is only needed for color images.
 * @property {function} getImage - a function that returns a JavaScript Image object with the image data. This is optional and typically used for images encoded in standard web JPEG and PNG formats
 * @property {Number} rows - number of rows in the image. This is the same as height but duplicated for convenience
 * @property {Number} columns - number of columns in the image. This is the same as width but duplicated for convenience
 * @property {Number} height - the height of the image. This is the same as rows but duplicated for convenience
 * @property {Number} width - the width of the image. This is the same as columns but duplicated for convenience
 * @property {Boolean} color - true if pixel data is RGB, false if grayscale
 * @property {Object} lut - The Lookup Table
 * @property {Boolean} rgba - Is the color pixel data stored in RGBA?
 * @property {Number} columnPixelSpacing - horizontal distance between the middle of each pixel (or width of each pixel) in mm or undefined if not known
 * @property {Number} rowPixelSpacing - vertical distance between the middle of each pixel (or heigh of each pixel) in mm or undefined if not known
 * @property {Boolean} invert - true if the the image should initially be displayed be inverted, false if not. This is here mainly to support DICOM images with a photometric interpretation of MONOCHROME1
 * @property {Number} sizeInBytes - the number of bytes used to store the pixels for this image.
 * @property {Boolean} [falseColor=false] - Whether or not the image has undergone false color mapping
 * @property {Array} [origPixelData] - Original pixel data for an image after it has undergone false color mapping
 * @property {ImageStats} [stats] - Statistics for the last redraw of the image
 * @property {Object} cachedLut - Cached Lookup Table for this image.
 */

/**
 * A Viewport Settings Object Cornerstone
 *
 * @typedef {Object} Viewport
 *
 * @property {Number} [scale=1.0] - The scale applied to the image. A scale of 1.0 will display no zoom (one image pixel takes up one screen pixel). A scale of 2.0 will be double zoom and a scale of .5 will be zoomed out by 2x
 * @param {vec2} [translation] - An object with properties x and y which describe the translation to apply in the pixel coordinate system. Note that the image is initially displayed centered in the enabled element with a x and y translation of 0 and 0 respectively.
 * @param {VOI} [voi] - an object with properties windowWidth and windowCenter.
 * @property {boolean} [invert=false] - Whether or not the image is inverted.
 * @property {boolean} [pixelReplication=false] - true if the image smooth / interpolation should be used when zoomed in on the image or false if pixel replication should be used.
 * @property {boolean} [hflip=false] - true if the image is flipped horizontally. Default is false
 * @property {boolean} [vflip=false] - true if the image is flipped vertically. Default is false
 * @property {Number} [rotation=0] - the rotation of the image (90 degree increments). Default is 0
 * @property {LUT} [modalityLUT] - the modality LUT to apply or undefined if none
 * @property {LUT} [voiLUT] - the modality LUT to apply or undefined if none
 */

/**
 * An Enabled Element in Cornerstone
 *
 * @typedef {Object} EnabledElement
 *
 * @property {HTMLElement} element - The DOM element which has been enabled for use by Cornerstone
 * @property {Image} [image] - The image currently displayed in the enabledElement
 * @property {Viewport} [viewport] - The current viewport settings of the enabledElement
 * @property {HTMLCanvasElement} [canvas] - The current canvas for this enabledElement
 * @property {Boolean} invalid - Whether or not the image pixel data underlying the enabledElement has been changed, necessitating a redraw
 * @property {Boolean} needsRedraw - A flag for triggering a redraw of the canvas without re-retrieving the pixel data, since it remains valid
 * @property {EnabledElementLayer[]} [layers] - The layers that have been added to the enabledElement
 * @property {Boolean} [syncViewports] - Whether or not to synchronize the viewport parameters
 * for each of the enabled element's layers
 * @property {Boolean} [lastSyncViewportsState] - The previous state for the sync viewport boolean
 */

/**
 * An Enabled Element Layer in Cornerstone
 *
 * @typedef {Object} EnabledElementLayer
 *
 * @property {HTMLElement} element - The DOM element which has been enabled for use by Cornerstone
 * @property {Image} [image] - The image currently displayed in the enabledElement
 * @property {Viewport} [viewport] - The current viewport settings of the enabledElement
 * @property {HTMLCanvasElement} [canvas] - The current canvas for this enabledElement
 * @property {Object} [options] - Layer drawing options
 * @property {Boolean} invalid - Whether or not the image pixel data underlying the enabledElement has been changed, necessitating a redraw
 * @property {Boolean} needsRedraw - A flag for triggering a redraw of the canvas without re-retrieving the pixel data, since it remains valid
 */


/**
 * Retrieves a Cornerstone Enabled Element object
 *
 * @param {HTMLElement} element An HTML Element enabled for Cornerstone
 *
 * @returns {EnabledElement} A Cornerstone Enabled Element
 */
export function getEnabledElement (element) {
  if (element === undefined) {
    throw new Error('getEnabledElement: parameter element must not be undefined');
  }
  for (let i = 0; i < enabledElements.length; i++) {
    if (enabledElements[i].element === element) {
      return enabledElements[i];
    }
  }

  throw new Error('element not enabled');
}

/**
 * Adds a Cornerstone Enabled Element object to the central store of enabledElements
 *
 * @param {EnabledElement} enabledElement A Cornerstone enabledElement Object
 * @returns {void}
 */
export function addEnabledElement (enabledElement) {
  if (enabledElement === undefined) {
    throw new Error('getEnabledElement: enabledElement element must not be undefined');
  }

  enabledElements.push(enabledElement);
}

/**
 * Adds a Cornerstone Enabled Element object to the central store of enabledElements
 *
 * @param {string} imageId A Cornerstone Image ID
 * @returns {EnabledElement[]} An Array of Cornerstone enabledElement Objects
 */
export function getEnabledElementsByImageId (imageId) {
  const ees = [];

  enabledElements.forEach(function (enabledElement) {
    if (enabledElement.image && enabledElement.image.imageId === imageId) {
      ees.push(enabledElement);
    }
  });

  return ees;
}

/**
 * Retrieve all of the currently enabled Cornerstone elements
 *
 * @return {EnabledElement[]} An Array of Cornerstone enabledElement Objects
 */
export function getEnabledElements () {
  return enabledElements;
}
