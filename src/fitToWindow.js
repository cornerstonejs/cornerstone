import { getEnabledElement } from './enabledElements.js';
import updateImage from './updateImage.js';
import getImageSize from './internal/getImageSize.js';

/**
 * Adjusts an image's scale and translation so the image is centered and all pixels
 * in the image are viewable.
 *
 * @param {HTMLElement} element The Cornerstone element to update
 * @returns {void}
 */
export default function (element) {
  const enabledElement = getEnabledElement(element);
  const imageSize = getImageSize(enabledElement);

  const { image } = enabledElement;
  let verticalRatio = 1;
  let horizontalRatio = 1;

  if (image.rowPixelSpacing < image.columnPixelSpacing) {
    // we believe that the row pixel is the same as css pixel
    horizontalRatio = image.columnPixelSpacing / image.rowPixelSpacing;
  } else {
    // we believe that the column pixel is the same as css pixel
    verticalRatio = image.rowPixelSpacing / image.columnPixelSpacing;
  }

  const verticalScale = enabledElement.canvas.height / imageSize.height / verticalRatio;
  const horizontalScale = enabledElement.canvas.width / imageSize.width / horizontalRatio;

  // The new scale is the minimum of the horizontal and vertical scale values
  enabledElement.viewport.scale = Math.min(horizontalScale, verticalScale);

  enabledElement.viewport.translation.x = 0;
  enabledElement.viewport.translation.y = 0;
  updateImage(element);
}
