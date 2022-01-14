/**
 * Get current fillStyle for enabled element
 *
 * @param {Object} enabledElement Enabled element
 * @returns {String} Current fillStyle of enabled element
 */
export default function (enabledElement) {
  const { invert } = enabledElement.viewport || {};
  const { fillStyle } = enabledElement.options || {};

  if (['black', 'white'].indexOf(fillStyle) !== -1) {
    return invert ? 'white' : 'black';
  }

  return 'black';
}
