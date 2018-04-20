/**
 * Retrieves the current image dimensions given an enabled element
 *
 * @param {any} image The Cornerstone image.
 * @param {Number} rotation Optional. The rotation angle of the image.
 * @return {{width, height}} The Image dimensions
 */
export default function (image, rotation = null) {

  if (image.width === undefined || image.height === undefined) {
    throw new Error('getImageSize: parameter image must have width/height');
  }

  if (rotation === undefined || rotation === 0 || rotation === 180) {
    return {
      width: image.width,
      height: image.height
    };
  }

  return {
    width: image.height,
    height: image.width
  };
}
