/**
 * Internal API function to draw an image to a given enabled element
 *
 * @param {EnabledElement} enabledElement The Cornerstone Enabled Element to redraw
 * @param {Boolean} [invalidated = false] - true if pixel data has been invalidated and cached rendering should not be used
 * @returns {void}
 * @memberof Internal
 */
export default function (enabledElement, invalidated = false) {
  enabledElement.needsRedraw = true;
  if (invalidated) {
    enabledElement.invalid = true;
  }
}
