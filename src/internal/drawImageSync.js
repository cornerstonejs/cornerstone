import now from './now.js';
import drawCompositeImage from './drawCompositeImage.js';
import { renderColorImage } from '../rendering/renderColorImage.js';
import { renderGrayscaleImage } from '../rendering/renderGrayscaleImage.js';
import { renderPseudoColorImage } from '../rendering/renderPseudoColorImage.js';
import { renderLabelMapImage } from '../rendering/renderLabelMapImage.js';
import triggerEvent from '../triggerEvent.js';
import EVENTS from '../events.js';
import getTransform from './getTransform.js';

function renderOverlays(enabledElement, overlays) {
  if (!overlays || overlays.length===0) return;

  const imageWidth = Math.abs(enabledElement.viewport.displayedArea.brhc.x - enabledElement.viewport.displayedArea.tlhc.x) * enabledElement.viewport.displayedArea.columnPixelSpacing;
  const imageHeight = Math.abs(enabledElement.viewport.displayedArea.brhc.y - enabledElement.viewport.displayedArea.tlhc.y) * enabledElement.viewport.displayedArea.rowPixelSpacing;

  const context = enabledElement.canvas.getContext('2d');
  context.save();

  overlays.forEach(overlay => {
    if (!overlay.visible) return;
    const layerCanvas = document.createElement('canvas');
    layerCanvas.width = imageWidth;
    layerCanvas.height = imageHeight;
    const layerContext = layerCanvas.getContext('2d');
    const transform = getTransform(enabledElement);
    layerContext.setTransform(transform.m[0], transform.m[1], transform.m[2], transform.m[3], transform.m[4], transform.m[5]);
    layerContext.save();
    layerContext.setTransform(1, 0, 0, 1, 0, 0);
    layerContext.fillStyle = overlay.fillStyle;

    if (overlay.type === 'R') {
      layerContext.fillRect(0, 0, layerCanvas.width, layerCanvas.height);
      layerContext.globalCompositeOperation = 'xor';
    }

    let i = 0;
    for (let y = 0; y < overlay.rows; y++) {
      for (let x = 0; x < overlay.columns; x++) {
        if (overlay.pixelData[i++] > 0) {
          layerContext.fillRect(x, y, 1, 1);
        }
      }
    }
    layerContext.restore();
    context.drawImage(layerCanvas, 0, 0);  
  });

  context.restore();  
}

/**
 * Draw an image to a given enabled element synchronously
 *
 * @param {EnabledElement} enabledElement An enabled element to draw into
 * @param {Boolean} invalidated - true if pixel data has been invalidated and cached rendering should not be used
 * @returns {void}
 * @memberof Internal
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

  image.stats = {
    lastGetPixelDataTime: -1.0,
    lastStoredPixelDataToCanvasImageDataTime: -1.0,
    lastPutImageDataTime: -1.0,
    lastRenderTime: -1.0,
    lastLutGenerateTime: -1.0
  };

  if (layers && layers.length) {
    drawCompositeImage(enabledElement, invalidated);
  } else if (image) {
    let render = image.render;

    if (!render) {
      if (enabledElement.viewport.colormap &&
          enabledElement.viewport.colormap !== '' &&
          enabledElement.image.labelmap === true) {
        render = renderLabelMapImage;
      } else if (enabledElement.viewport.colormap && enabledElement.viewport.colormap !== '') {
        render = renderPseudoColorImage;
      } else if (image.color) {
        render = renderColorImage;
      } else {
        render = renderGrayscaleImage;
      }
    }

    render(enabledElement, invalidated);
    renderOverlays(enabledElement, image.overlays);
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

  triggerEvent(element, EVENTS.IMAGE_RENDERED, eventData);
}
