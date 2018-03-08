import { getEnabledElement } from './enabledElements.js';
import fitToWindow from './fitToWindow.js';
import updateImage from './updateImage.js';
import triggerEvent from './triggerEvent.js';
import getImageSize from './internal/getImageSize.js';
import EVENTS from './events.js';

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

  // Avoid setting the same value because it flashes the canvas with IE and Edge
  if (canvas.width !== element.clientWidth) {
    canvas.width = element.clientWidth;
    canvas.style.width = `${element.clientWidth}px`;
  }
  // Avoid setting the same value because it flashes the canvas with IE and Edge
  if (canvas.height !== element.clientHeight) {
    canvas.height = element.clientHeight;
    canvas.style.height = `${element.clientHeight}px`;
  }
}

/**
 * Checks if the image of a given enabled element fitted the window
 * before the resize
 *
 * @param {EnabledElement} enabledElement The Cornerstone Enabled Element
 * @param {number} oldCanvasWidth The width of the canvas before the resize
 * @param {number} oldCanvasHeight The height of the canvas before the resize
 * @return {Boolean} true if it fitted the windows, false otherwise
 */
function wasFitToWindow (enabledElement, oldCanvasWidth, oldCanvasHeight) {
  const scale = enabledElement.viewport.scale;
  const imageSize = getImageSize(enabledElement);
  const imageWidth = Math.round(imageSize.width * scale);
  const imageHeight = Math.round(imageSize.height * scale);
  const x = enabledElement.viewport.translation.x;
  const y = enabledElement.viewport.translation.y;

  return (imageWidth === oldCanvasWidth && imageHeight <= oldCanvasHeight) ||
    (imageWidth <= oldCanvasWidth && imageHeight === oldCanvasHeight) &&
    (x === 0 && y === 0);
}

/**
 * Rescale the image relative to the changed size of the canvas
 *
 * @param {EnabledElement} enabledElement The Cornerstone Enabled Element
 * @param {number} oldCanvasWidth The width of the canvas before the resize
 * @param {number} oldCanvasHeight The height of the canvas before the resize
 * @return {void}
 */
function relativeRescale (enabledElement, oldCanvasWidth, oldCanvasHeight) {
  const scale = enabledElement.viewport.scale;
  const canvasWidth = enabledElement.canvas.width;
  const canvasHeight = enabledElement.canvas.height;
  const relWidthChange = canvasWidth / oldCanvasWidth;
  const relHeightChange = canvasHeight / oldCanvasHeight;
  const relChange = Math.sqrt(relWidthChange * relHeightChange);

  enabledElement.viewport.scale = relChange * scale;
}

/**
 * Resizes an enabled element and optionally fits the image to window
 *
 * @param {HTMLElement} element The DOM element enabled for Cornerstone
 * @param {Boolean} forceFitToWindow true to to force a refit, false to rescale accordingly
 * @returns {void}
 */
export default function (element, forceFitToWindow) {
  const enabledElement = getEnabledElement(element);

  const oldCanvasWidth = enabledElement.canvas.width;
  const oldCanvasHeight = enabledElement.canvas.height;

  setCanvasSize(element, enabledElement.canvas);

  const eventData = { element };

  triggerEvent(element, EVENTS.ELEMENT_RESIZED, eventData);

  if (enabledElement.image === undefined) {
    return;
  }

  if (forceFitToWindow === true) {
    fitToWindow(element);

    return;
  }

  if (wasFitToWindow(enabledElement, oldCanvasWidth, oldCanvasHeight)) {
    // Fit the image to the window again if it fitted before the resize
    fitToWindow(element);
  } else {
    // Adapt the scale of a zoomed or panned image relative to the size change
    relativeRescale(enabledElement, oldCanvasWidth, oldCanvasHeight);

    updateImage(element);
  }
}
