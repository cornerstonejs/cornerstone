/**
 * Retrieves the current image dimensions given an enabled element
 *
 * @param {EnabledElement} enabledElement The Cornerstone Enabled Element
 * @return {{width, height}} The Image dimensions
 */
export default function (enabledElement) {
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
