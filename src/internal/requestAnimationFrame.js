/**
 * This module polyfills requestAnimationFrame for older browsers.
 */

function requestFrame(callback) {
  window.setTimeout(callback, 1000 / 60);
}

export function requestAnimationFrame(callback) {
  return window.requestAnimationFrame(callback) ||
    window.webkitRequestAnimationFrame(callback) ||
    window.mozRequestAnimationFrame(callback) ||
    window.oRequestAnimationFrame(callback) ||
    window.msRequestAnimationFrame(callback) ||
    requestFrame(callback);
}
