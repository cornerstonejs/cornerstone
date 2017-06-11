/**
 * This module is responsible for drawing an image to an enabled elements canvas element
 */
import setToPixelCoordinateSystem from '../setToPixelCoordinateSystem.js';
import { renderColorImage } from './renderColorImage.js';

/**
 * API function to draw a standard web image (PNG, JPG) to an enabledImage
 *
 * @param {EnabledElement} enabledElement The Cornerstone Enabled Element to redraw
 * @param {Boolean} invalidated - true if pixel data has been invalidated and cached rendering should not be used
 * @returns {void}
 */
export function renderWebImage (enabledElement, invalidated) {

  if (enabledElement === undefined) {
    throw new Error('drawImage: enabledElement parameter must not be undefined');
  }
  const image = enabledElement.image;

  if (image === undefined) {
    throw new Error('drawImage: image must be loaded before it can be drawn');
  }

    // Get the canvas context and reset the transform
  const context = enabledElement.canvas.getContext('2d');

  context.setTransform(1, 0, 0, 1, 0, 0);

    // Clear the canvas
  context.fillStyle = 'black';
  context.fillRect(0, 0, enabledElement.canvas.width, enabledElement.canvas.height);

    // Turn off image smooth/interpolation if pixelReplication is set in the viewport
  if (enabledElement.viewport.pixelReplication === true) {
    context.imageSmoothingEnabled = false;
    context.mozImageSmoothingEnabled = false; // Firefox doesn't support imageSmoothingEnabled yet
  } else {
    context.imageSmoothingEnabled = true;
    context.mozImageSmoothingEnabled = true;
  }

    // Save the canvas context state and apply the viewport properties
  setToPixelCoordinateSystem(enabledElement, context);

    // If the viewport ww/wc and invert all match the initial state of the image, we can draw the image
    // Directly.  If any of those are changed, we call renderColorImage() to apply the lut
  if (enabledElement.viewport.voi.windowWidth === enabledElement.image.windowWidth &&
        enabledElement.viewport.voi.windowCenter === enabledElement.image.windowCenter &&
        enabledElement.viewport.invert === false) {
    context.drawImage(image.getImage(), 0, 0, image.width, image.height, 0, 0, image.width, image.height);
  } else {
    renderColorImage(enabledElement, invalidated);
  }

}
