/**
 * This module contains a function that will set the canvas context to the pixel coordinates system
 * making it easy to draw geometry on the image
 */

import calculateTransform from './internal/calculateTransform.js';

/**
 * Sets the canvas context transformation matrix to the pixel coordinate system.  This allows
 * geometry to be driven using the canvas context using coordinates in the pixel coordinate system
 * @param {EnabledElement} enabledElement The
 * @param {CanvasRenderingContext2D} context The CanvasRenderingContext2D for the enabledElement's Canvas
 * @param {Number} scale Optional scale to apply
 * @returns {void}
 */
export default function (enabledElement, context, scale) {
  if (enabledElement === undefined) {
    throw new Error('setToPixelCoordinateSystem: parameter enabledElement must not be undefined');
  }
  if (context === undefined) {
    throw new Error('setToPixelCoordinateSystem: parameter context must not be undefined');
  }

  const transform = calculateTransform(enabledElement, scale);

  context.setTransform(transform.m[0], transform.m[1], transform.m[2], transform.m[3], transform.m[4], transform.m[5]);
}
