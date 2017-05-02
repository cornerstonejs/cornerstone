import { getEnabledElement } from './enabledElements';
import updateImage from './updateImage';

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

  // User can pass a colormap or its id as string to some of these public functions.
  // Then we need to make sure it will be converted into a colormap object if it's as string.
function ensuresColormap (colormap) {
  if (colormap && (typeof colormap === 'string')) {
    colormap = cornerstone.colors.getColormap(colormap);
  }

  return colormap;
}

  /**
   * Restores a false color image to its original version
   * @param image
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
   * @param image
   * @param colormap - it can be a colormap object or a colormap id (string)
   */
function convertImageToFalseColorImage (image, colormap) {
  if (image.color && !image.falseColor) {
    throw 'Color transforms are not implemented yet';
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
    cornerstone.pixelDataToFalseColorData(image, lookupTable);

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
 * @param element
 * @param colormap - it can be a colormap object or a colormap id (string)
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
