/**
 * This module will fit an image to fit inside the canvas displaying it such that all pixels
 * in the image are viewable
 */

import { getEnabledElement } from './enabledElements.js';
import updateImage from './updateImage.js';

function getImageSize (enabledElement) {
  if (enabledElement.viewport.rotation === 0 || enabledElement.viewport.rotation === 180) {
    return {
      width: enabledElement.image.width,
      height: enabledElement.image.height
    };
  }

  return {
    width: enabledElement.image.height,
    height: enabledElement.image.width
  };

}

/**
 * Adjusts an images scale and center so the image is centered and completely visible
 * @param element
 */
export default function (element) {
  const enabledElement = getEnabledElement(element);
  const imageSize = getImageSize(enabledElement);

  const verticalScale = enabledElement.canvas.height / imageSize.height;
  const horizontalScale = enabledElement.canvas.width / imageSize.width;

  if (horizontalScale < verticalScale) {
    enabledElement.viewport.scale = horizontalScale;
  } else {
    enabledElement.viewport.scale = verticalScale;
  }
  enabledElement.viewport.translation.x = 0;
  enabledElement.viewport.translation.y = 0;
  updateImage(element);
}
