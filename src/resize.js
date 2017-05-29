import { getEnabledElement } from './enabledElements.js';
import fitToWindow from './fitToWindow.js';
import updateImage from './updateImage.js';

/**
 * This module is responsible for enabling an element to display images with cornerstone
 *
 * @param {HTMLElement} element The DOM element enabled for Cornerstone
 * @param {HTMLElement} canvas The Canvas DOM element within the DOM element enabled for Cornerstone
 * @returns {void}
 */
function setCanvasSize (element, canvas) {
    // The device pixel ratio is 1.0 for normal displays and > 1.0
    // For high DPI displays like Retina
    /*

    This functionality is disabled due to buggy behavior on systems with mixed DPI's.  If the canvas
    is created on a display with high DPI (e.g. 2.0) and then the browser window is dragged to
    a different display with a different DPI (e.g. 1.0), the canvas is not recreated so the pageToPixel
    produces incorrect results.  I couldn't find any way to determine when the DPI changed other than
    by polling which is not very clean.  If anyone has any ideas here, please let me know, but for now
    we will disable this functionality.  We may want
    to add a mechanism to optionally enable this functionality if we can determine it is safe to do
    so (e.g. iPad or iPhone or perhaps enumerate the displays on the system.  I am choosing
    to be cautious here since I would rather not have bug reports or safety issues related to this
    scenario.

    var devicePixelRatio = window.devicePixelRatio;
    if(devicePixelRatio === undefined) {
        devicePixelRatio = 1.0;
    }
    */

  canvas.width = element.clientWidth;
  canvas.height = element.clientHeight;
  canvas.style.width = `${element.clientWidth}px`;
  canvas.style.height = `${element.clientHeight}px`;
}

/**
 * Resizes an enabled element and optionally fits the image to window
 *
 * @param {HTMLElement} element The DOM element enabled for Cornerstone
 * @param {Boolean} fitViewportToWindow true to refit, false to leave viewport parameters as they are
 * @returns {void}
 */
export default function (element, fitViewportToWindow) {

  const enabledElement = getEnabledElement(element);

  setCanvasSize(element, enabledElement.canvas);

  const eventData = {
    element
  };

  $(element).trigger('CornerstoneElementResized', eventData);

  if (enabledElement.image === undefined) {
    return;
  }

  if (fitViewportToWindow === true) {
    fitToWindow(element);
  } else {
    updateImage(element);
  }
}
