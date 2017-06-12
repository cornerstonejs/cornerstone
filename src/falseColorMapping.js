import { getEnabledElement } from './enabledElements.js';
import updateImage from './updateImage.js';
import pixelDataToFalseColorData from './pixelDataToFalseColorData.js';
import { getColormap } from './colors/colormap.js';

/**
 * Retrieves the minimum and maximum pixel values from an Array of pixel data
 *
 * @param {Array} pixelData The input pixel data array
 *
 * @returns {{minPixelValue: Number, maxPixelValue: Number}} The minimum and maximum pixel values in the input Array
 */
function getPixelValues (pixelData) {
  let minPixelValue = Number.MAX_VALUE;
  let maxPixelValue = Number.MIN_VALUE;
  const len = pixelData.length;
  let pixel;

  for (let i = 0; i < len; i++) {
    pixel = pixelData[i];
    minPixelValue = minPixelValue < pixel ? minPixelValue : pixel;
    maxPixelValue = maxPixelValue > pixel ? maxPixelValue : pixel;
  }

  return {
    minPixelValue,
    maxPixelValue
  };
}

/**
 * Retrieve a function that will allow an image object to be reset to its original form
 * after a false color mapping transformation
 *
 * @param {Image} image A Cornerstone Image Object
 *
 * @return {Function} A function for resetting an Image Object to its original form
 */
function getRestoreImageMethod (image) {
  if (image.restore) {
    return image.restore;
  }

  const color = image.color;
  const rgba = image.rgba;
  const lut = image.lut;
  const slope = image.slope;
  const windowWidth = image.windowWidth;
  const windowCenter = image.windowCenter;
  const minPixelValue = image.minPixelValue;
  const maxPixelValue = image.maxPixelValue;

  return function () {
    image.color = color;
    image.rgba = rgba;
    image.lut = lut;
    image.slope = slope;
    image.windowWidth = windowWidth;
    image.windowCenter = windowCenter;
    image.minPixelValue = minPixelValue;
    image.maxPixelValue = maxPixelValue;

    if (image.origPixelData) {
      const pixelData = image.origPixelData;

      image.getPixelData = function () {
        return pixelData;
      };
    }

    // Remove some attributes added by false color mapping
    delete image.origPixelData;
    delete image.colormapId;
    delete image.falseColor;
  };
}

  //
  // Then we need to make sure it will be converted into a colormap object if it's as string.

/**
 * User can pass a colormap or its id as string to some of these public functions.
 * Then we need to make sure it will be converted into a colormap object if it's a string.
 *
 * @param {*} colormap A colormap ID or Object
 * @return {*} The colormap
 */
function ensuresColormap (colormap) {
  if (colormap && (typeof colormap === 'string')) {
    colormap = getColormap(colormap);
  }

  return colormap;
}

/**
 * Restores a false color image to its original version
 *
 * @param {Image} image A Cornerstone Image Object
 * @returns {Boolean} True if the image object had a valid restore function, which was run. Otherwise, false.
 */
function restoreImage (image) {
  if (image.restore && (typeof image.restore === 'function')) {
    image.restore();

    return true;
  }

  return false;
}

/**
 * Convert an image to a false color image
 * @param {Image} image A Cornerstone Image Object
 * @param {String|Object} colormap - it can be a colormap object or a colormap id (string)
 *
 * @returns {Boolean} - Whether or not the image has been converted to a false color image
 */
function convertImageToFalseColorImage (image, colormap) {
  if (image.color && !image.falseColor) {
    throw new Error('Color transforms are not implemented yet');
  }

  // User can pass a colormap id or a colormap object
  colormap = ensuresColormap(colormap);

  const colormapId = colormap.getId();

  // Doesn't do anything if colormapId hasn't changed
  if (image.colormapId === colormapId) {
    // It has already being converted into a false color image
    // Using the colormapId passed as parameter
    return false;
  }

  // Restore the image attributes updated when converting to a false color image
  restoreImage(image);

  // Convert the image to a false color image
  if (colormapId) {
    const minPixelValue = image.minPixelValue || 0;
    const maxPixelValue = image.maxPixelValue || 255;

    image.restore = getRestoreImageMethod(image);

    const lookupTable = colormap.createLookupTable();

    lookupTable.setTableRange(minPixelValue, maxPixelValue);

    // Update the pixel data and render the new image
    pixelDataToFalseColorData(image, lookupTable);

    // Update min and max pixel values
    const pixelValues = getPixelValues(image.getPixelData());

    image.minPixelValue = pixelValues.minPixelValue;
    image.maxPixelValue = pixelValues.maxPixelValue;

    // Cache the last colormapId used for performance
    // Then it doesn't need to be re-rendered on next
    // Time if the user hasn't updated it
    image.colormapId = colormapId;
  }

  // Return `true` to tell the caller that the image has got updated
  return true;
}

/**
 * Convert the image of a element to a false color image
 *
 * @param {HTMLElement} element The Cornerstone element
 * @param {*} colormap - it can be a colormap object or a colormap id (string)
 *
 * @returns {void}
 */
function convertToFalseColorImage (element, colormap) {
  const enabledElement = getEnabledElement(element);
  const falseColorImageUpdated = convertImageToFalseColorImage(enabledElement.image, colormap);

  if (falseColorImageUpdated) {
    updateImage(element, true);
  }
}

export { convertImageToFalseColorImage,
         convertToFalseColorImage,
         restoreImage };
