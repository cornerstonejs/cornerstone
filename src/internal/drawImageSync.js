import now from './now.js';
import drawCompositeImage from './drawCompositeImage.js';
import { renderColorImage } from '../rendering/renderColorImage.js';
import { renderGrayscaleImage } from '../rendering/renderGrayscaleImage.js';

/**
 * Draw an image to a given enabled element synchronously
 *
 * @param {EnabledElement} enabledElement An enabled element to draw into
 * @param {Boolean} invalidated - true if pixel data has been invalidated and cached rendering should not be used
 * @returns {void}
 */
export default function (enabledElement, invalidated) {
  const image = enabledElement.image;
  const element = enabledElement.element;
  const layers = enabledElement.layers || [];

    // Check if enabledElement can be redrawn
  if (!enabledElement.canvas || !(enabledElement.image || layers.length)) {
    return;
  }

    // Start measuring the time needed to draw the image/layers
  const start = now();

  if (layers && layers.length) {
    drawCompositeImage(enabledElement, invalidated);
  } else if (image) {
    let render = image.render;

    image.stats = {
      lastGetPixelDataTime: -1.0,
      lastStoredPixelDataToCanvasImageDataTime: -1.0,
      lastPutImageDataTime: -1.0,
      lastRenderTime: -1.0,
      lastLutGenerateTime: -1.0
    };

    if (!render) {
      render = image.color ? renderColorImage : renderGrayscaleImage;
    }

    render(enabledElement, invalidated);
  }

    // Calculate how long it took to draw the image/layers
  const renderTimeInMs = now() - start;

  const eventData = {
    viewport: enabledElement.viewport,
    element,
    image,
    enabledElement,
    canvasContext: enabledElement.canvas.getContext('2d'),
    renderTimeInMs
  };

  image.stats.lastRenderTime = renderTimeInMs;

  enabledElement.invalid = false;
  enabledElement.needsRedraw = false;

  $(element).trigger('CornerstoneImageRendered', eventData);
}
