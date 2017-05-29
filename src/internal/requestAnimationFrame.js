function requestFrame (callback) {
  window.setTimeout(callback, 1000 / 60);
}

/**
 * Polyfills requestAnimationFrame for older browsers.
 *
 * @param {Function} callback A parameter specifying a function to call when it's time to update your animation for the next repaint. The callback has one single argument, a DOMHighResTimeStamp, which indicates the current time (the time returned from performance.now() ) for when requestAnimationFrame starts to fire callbacks.
 *
 * @return {Number} A long integer value, the request id, that uniquely identifies the entry in the callback list. This is a non-zero value, but you may not make any other assumptions about its value. You can pass this value to window.cancelAnimationFrame() to cancel the refresh callback request.
 */
export default function (callback) {
  return window.requestAnimationFrame(callback) ||
    window.webkitRequestAnimationFrame(callback) ||
    window.mozRequestAnimationFrame(callback) ||
    window.oRequestAnimationFrame(callback) ||
    window.msRequestAnimationFrame(callback) ||
    requestFrame(callback);
}
