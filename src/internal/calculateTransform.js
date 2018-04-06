import { Transform } from './transform.js';

/**
 * Calculate the transform for a Cornerstone enabled element
 *
 * @param {EnabledElement} enabledElement The Cornerstone Enabled Element
 * @param {Number} [scale] The viewport scale
 * @return {Transform} The current transform
 * @memberof Internal
 */
export default function (enabledElement, scale) {

  const transform = new Transform();

  // Move to center of canvas
  transform.translate(enabledElement.canvas.width / 2, enabledElement.canvas.height / 2);

  // Apply the rotation before scaling for non square pixels
  const angle = enabledElement.viewport.rotation;

  if (angle !== 0) {
    transform.rotate(angle * Math.PI / 180);
  }

  // Apply the scale
  let widthScale = enabledElement.viewport.scale;
  let heightScale = enabledElement.viewport.scale;

  const width = enabledElement.viewport.displayedArea.brhc.x - (enabledElement.viewport.displayedArea.tlhc.x - 1);
  const height = enabledElement.viewport.displayedArea.brhc.y - (enabledElement.viewport.displayedArea.tlhc.y - 1);

  if (enabledElement.viewport.displayedArea.presentationSizeMode === 'NONE') {
    if (enabledElement.image.rowPixelSpacing < enabledElement.image.columnPixelSpacing) {
      widthScale *= (enabledElement.image.columnPixelSpacing / enabledElement.image.rowPixelSpacing);
    } else if (enabledElement.image.columnPixelSpacing < enabledElement.image.rowPixelSpacing) {
      heightScale *= (enabledElement.image.rowPixelSpacing / enabledElement.image.columnPixelSpacing);
    }
  } else {
    // These should be good for "TRUE SIZE" and "MAGNIFY"
    widthScale = enabledElement.viewport.displayedArea.columnPixelSpacing;
    heightScale = enabledElement.viewport.displayedArea.rowPixelSpacing;

    if (enabledElement.viewport.displayedArea.presentationSizeMode === 'SCALE TO FIT') {
      // Fit TRUE IMAGE image (width/height) to window
      const verticalScale = enabledElement.canvas.height / (height * heightScale);
      const horizontalScale = enabledElement.canvas.width / (width * widthScale);

      // Apply new scale
      widthScale = heightScale = Math.min(horizontalScale, verticalScale);

      if (enabledElement.viewport.displayedArea.rowPixelSpacing < enabledElement.viewport.displayedArea.columnPixelSpacing) {
        widthScale *= (enabledElement.viewport.displayedArea.columnPixelSpacing / enabledElement.viewport.displayedArea.rowPixelSpacing);
      } else if (enabledElement.viewport.displayedArea.columnPixelSpacing < enabledElement.viewport.displayedArea.rowPixelSpacing) {
        heightScale *= (enabledElement.viewport.displayedArea.rowPixelSpacing / enabledElement.viewport.displayedArea.columnPixelSpacing);
      }
    }
  }

  transform.scale(widthScale, heightScale);

  // Unrotate to so we can translate unrotated
  if (angle !== 0) {
    transform.rotate(-angle * Math.PI / 180);
  }

  // Apply the pan offset
  transform.translate(enabledElement.viewport.translation.x, enabledElement.viewport.translation.y);

  // Rotate again so we can apply general scale
  if (angle !== 0) {
    transform.rotate(angle * Math.PI / 180);
  }

  if (scale !== undefined) {
    // Apply the font scale
    transform.scale(scale, scale);
  }

  // Apply Flip if required
  if (enabledElement.viewport.hflip) {
    transform.scale(-1, 1);
  }

  if (enabledElement.viewport.vflip) {
    transform.scale(1, -1);
  }

  // Move back from center of image
  transform.translate(-width / 2, -height / 2);

  return transform;
}
