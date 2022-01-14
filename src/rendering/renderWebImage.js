import setToPixelCoordinateSystem from '../setToPixelCoordinateSystem.js';
import { renderColorImage } from './renderColorImage.js';
import getDisplayedArea from '../internal/getDisplayedArea.js';

/**
 * API function to draw a standard web image (PNG, JPG) to an enabledImage
 *
 * @param {EnabledElement} enabledElement The Cornerstone Enabled Element to redraw
 * @param {Boolean} invalidated - true if pixel data has been invalidated and cached rendering should not be used
 * @returns {void}
 * @memberof rendering
 */
export function renderWebImage (enabledElement, invalidated) {
  if (enabledElement === undefined) {
    throw new Error('renderWebImage: enabledElement parameter must not be undefined');
  }

  const image = enabledElement.image;

  if (image === undefined) {
    throw new Error('renderWebImage: image must be loaded before it can be drawn');
  }

  // If the viewport ww/wc and invert all match the initial state of the image, we can draw the image
  // Directly. If any of those are changed, we call renderColorImage() to apply the lut
  if (enabledElement.viewport.voi.windowWidth === enabledElement.image.windowWidth &&
        enabledElement.viewport.voi.windowCenter === enabledElement.image.windowCenter &&
        enabledElement.viewport.invert === false) {

    // Get the canvas context and reset the transform
    const context = enabledElement.canvas.getContext('2d', {
      desynchronized: true
    });

    context.setTransform(1, 0, 0, 1, 0, 0);

    // Clear the canvas
    context.fillStyle = 'black';
    context.fillRect(0, 0, enabledElement.canvas.width, enabledElement.canvas.height);

    // Turn off image smooth/interpolation if pixelReplication is set in the viewport
    context.imageSmoothingEnabled = !enabledElement.viewport.pixelReplication;
    context.mozImageSmoothingEnabled = context.imageSmoothingEnabled;

    // Save the canvas context state and apply the viewport properties
    setToPixelCoordinateSystem(enabledElement, context);
    const imageDisplayedArea = getDisplayedArea(enabledElement.image, enabledElement.viewport);
    const sx = imageDisplayedArea.tlhc.x - 1;
    const sy = imageDisplayedArea.tlhc.y - 1;
    const width = imageDisplayedArea.brhc.x - sx;
    const height = imageDisplayedArea.brhc.y - sy;

    context.drawImage(image.getImage(), sx, sy, width, height, sx, sy, width, height);
  } else {
    renderColorImage(enabledElement, invalidated);
  }
}
