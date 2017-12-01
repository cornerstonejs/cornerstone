import { getEnabledElement } from './enabledElements.js';
import fitToWindow from './fitToWindow.js';
import updateImage from './updateImage.js';
import triggerEvent from './triggerEvent.js';
import getImageSize from './internal/getImageSize.js';
import EVENTS from './events.js';

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
  const imageSize = getImageSize(enabledElement.image, enabledElement.viewport.rotation);
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

  // Avoid setting the same value because it flashes the canvas with IE and Edge
  if (canvas.width !== image.columns) {
    canvas.width = image.columns;
    canvas.style.width = `${image.columns}px`;
  }
  // Avoid setting the same value because it flashes the canvas with IE and Edge
  if (canvas.height !== image.rows) {
    canvas.height = image.rows;
    canvas.style.height = `${image.rows}px`;
  }

  /*setCanvasSize(element, enabledElement.canvas);

  const eventData = { element };

  triggerEvent(element, EVENTS.ELEMENT_RESIZED, eventData);

  if (enabledElement.image === undefined) {
    return;
  }

  if (forceFitToWindow || wasFitToWindow(enabledElement, oldCanvasWidth, oldCanvasHeight)) {
    // Fit the image to the window again if it fitted before the resize
    fitToWindow(element);
  } else {
    // Adapt the scale of a zoomed or panned image relative to the size change
    relativeRescale(enabledElement, oldCanvasWidth, oldCanvasHeight);

    updateImage(element);
  }*/
}
