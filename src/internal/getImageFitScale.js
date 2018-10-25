import { validateParameterUndefinedOrNull } from './validator.js';
import getImageSize from './getImageSize.js';


/**
 * Calculates the horizontal, vertical and minimum scale factor for an image
   @param {{width, height}} windowSize The window size where the image is displayed. This can be any HTML element or structure with a width, height fields (e.g. canvas).
 * @param {any} image The cornerstone image object
 * @param {Number} rotation Optional. The rotation angle of the image.
 * @return {{horizontalScale, verticalScale, scaleFactor}} The calculated horizontal, vertical and minimum scale factor
 * @memberof Internal
 */
export default function (windowSize, image, rotation = null) {

  validateParameterUndefinedOrNull(windowSize, 'getImageScale: parameter windowSize must not be undefined');
  validateParameterUndefinedOrNull(image, 'getImageScale: parameter image must not be undefined');

  const imageSize = getImageSize(image, rotation);
  const rowPixelSpacing = image.rowPixelSpacing || 1;
  const columnPixelSpacing = image.columnPixelSpacing || 1;
  let verticalRatio = 1;
  let horizontalRatio = 1;

  if (rowPixelSpacing < columnPixelSpacing) {
    horizontalRatio = columnPixelSpacing / rowPixelSpacing;
  } else {
    // even if they are equal we want to calculate this ratio (the ration might be 0.5)
    verticalRatio = rowPixelSpacing / columnPixelSpacing;
  }

  const verticalScale = windowSize.height / imageSize.height / verticalRatio;
  const horizontalScale = windowSize.width / imageSize.width / horizontalRatio;

  // Fit image to window
  return {
    verticalScale,
    horizontalScale,
    scaleFactor: Math.min(horizontalScale, verticalScale)
  };
}
