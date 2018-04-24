import { validateParameterUndefinedOrNull } from './validator.js';

/**
 * Check if the angle is rotated
 * @param {Number} rotation the rotation angle
 * @returns {Boolean} true if the angle is rotated; Otherwise, false.
 * @memberof Internal
 */
function isRotated (rotation) {
  return !(rotation === null || rotation === undefined || rotation === 0 || rotation === 180);
}

/**
 * Retrieves the current image dimensions given an enabled element
 *
 * @param {any} image The Cornerstone image.
 * @param {Number} rotation Optional. The rotation angle of the image.
 * @return {{width:Number, height:Number}} The Image dimensions
 * @memberof Internal
 */
export default function (image, rotation = null) {

  validateParameterUndefinedOrNull(image, 'getImageSize: parameter image must not be undefined');
  validateParameterUndefinedOrNull(image.width, 'getImageSize: parameter image must have width');
  validateParameterUndefinedOrNull(image.height, 'getImageSize: parameter image must have height');


  if (isRotated(rotation)) {
    return {
      height: image.width,
      width: image.height
    };
  }

  return {
    width: image.width,
    height: image.height
  };
}
