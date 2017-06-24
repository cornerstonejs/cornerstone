import { Transform } from './transform.js';

/**
 * Calculate the transform for a Cornerstone enabled element
 *
 * @param {EnabledElement} enabledElement The Cornerstone Enabled Element
 * @param {Number} [scale] The viewport scale
 * @return {Transform} The current transform
 */
export default function (enabledElement, scale) {

  const transform = new Transform();

  transform.translate(enabledElement.canvas.width / 2, enabledElement.canvas.height / 2);

    // Apply the rotation before scaling for non square pixels
  const angle = enabledElement.viewport.rotation;

  if (angle !== 0) {
    transform.rotate(angle * Math.PI / 180);
  }

    // Apply the scale
  let widthScale = enabledElement.viewport.scale;
  let heightScale = enabledElement.viewport.scale;

  if (enabledElement.image.rowPixelSpacing < enabledElement.image.columnPixelSpacing) {
    widthScale *= (enabledElement.image.columnPixelSpacing / enabledElement.image.rowPixelSpacing);
  } else if (enabledElement.image.columnPixelSpacing < enabledElement.image.rowPixelSpacing) {
    heightScale *= (enabledElement.image.rowPixelSpacing / enabledElement.image.columnPixelSpacing);
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

    // Translate the origin back to the corner of the image so the event handlers can draw in image coordinate system
  transform.translate(-enabledElement.image.width / 2, -enabledElement.image.height / 2);

  return transform;
}
