import { getLayers, getActiveLayer, getVisibleLayers } from '../layers.js';
import { addGrayscaleLayer } from '../rendering/renderGrayscaleImage.js';
import { addColorLayer } from '../rendering/renderColorImage.js';
import { addPseudoColorLayer } from '../rendering/renderPseudoColorImage.js';
import { addLabelMapLayer } from '../rendering/renderLabelMapImage.js';
import setToPixelCoordinateSystem from '../setToPixelCoordinateSystem.js';

// This is used to keep each of the layers' viewports in sync with the active layer
const originalViewportScale = {};

function getViewportRatio (baseLayerId, targetLayerId) {
  return originalViewportScale[targetLayerId] / originalViewportScale[baseLayerId];
}

// Sync all viewports based on active layer's viewport
function syncViewports (layers, activeLayer) {
  // If we intend to keep the viewport's scale, translation and rotation in sync,
  // loop through the layers
  layers.forEach((layer) => {
    // Don't do anything to the active layer
    // Don't do anything if this layer has no viewport
    if (layer === activeLayer ||
        !layer.viewport ||
        !activeLayer.viewport) {
      return;
    }

    if (!originalViewportScale[layer.layerId]) {
      originalViewportScale[layer.layerId] = layer.viewport.scale;
    }

    const viewportRatio = getViewportRatio(activeLayer.layerId, layer.layerId);

    // Update the layer's translation and scale to keep them in sync with the first image
    // based on the ratios between the images
    layer.viewport.scale = activeLayer.viewport.scale * viewportRatio;
    layer.viewport.rotation = activeLayer.viewport.rotation;
    layer.viewport.translation = {
      x: (activeLayer.viewport.translation.x / viewportRatio),
      y: (activeLayer.viewport.translation.y / viewportRatio)
    };
    layer.viewport.hflip = activeLayer.viewport.hflip;
    layer.viewport.vflip = activeLayer.viewport.vflip;
  });
}

/**
 * Internal function to render all layers for a Cornerstone enabled element
 *
 * @param {CanvasRenderingContext2D} context Canvas context to draw upon
 * @param {EnabledElementLayer[]} layers The array of all layers for this enabled element
 * @param {Boolean} invalidated A boolean whether or not this image has been invalidated and must be redrawn
 * @returns {void}
 * @memberof Internal
 */
function renderLayers (context, layers, invalidated) {
  // Loop through each layer and draw it to the canvas
  layers.forEach((layer, index) => {
    if (!layer.image) {
      return;
    }

    context.save();

    // Set the layer's canvas to the pixel coordinate system
    layer.canvas = context.canvas;
    setToPixelCoordinateSystem(layer, context);

    // Render into the layer's canvas
    const colormap = layer.viewport.colormap || layer.options.colormap;
    const labelmap = layer.viewport.labelmap;
    const isInvalid = layer.invalid || invalidated;

    if (colormap && colormap !== '' && labelmap === true) {
      addLabelMapLayer(layer, isInvalid);
    } else if (colormap && colormap !== '') {
      addPseudoColorLayer(layer, isInvalid);
    } else if (layer.image.color === true) {
      addColorLayer(layer, isInvalid);
    } else {
      // If this is the base layer, use the alpha channel for rendering of the grayscale image
      const useAlphaChannel = (index === 0);

      addGrayscaleLayer(layer, isInvalid, useAlphaChannel);
    }

    // Apply any global opacity settings that have been defined for this layer
    if (layer.options && layer.options.opacity) {
      context.globalAlpha = layer.options.opacity;
    } else {
      context.globalAlpha = 1;
    }

    if (layer.options && layer.options.fillStyle) {
      context.fillStyle = layer.options.fillStyle;
    }

    // Set the pixelReplication property before drawing from the layer into the
    // composite canvas
    context.imageSmoothingEnabled = !layer.viewport.pixelReplication;
    context.mozImageSmoothingEnabled = context.imageSmoothingEnabled;

    // Draw from the current layer's canvas onto the enabled element's canvas
    const sx = layer.viewport.displayedArea.tlhc.x - 1;
    const sy = layer.viewport.displayedArea.tlhc.y - 1;
    const width = layer.viewport.displayedArea.brhc.x - layer.viewport.displayedArea.tlhc.x;
    const height = layer.viewport.displayedArea.brhc.y - layer.viewport.displayedArea.tlhc.y;

    context.drawImage(layer.canvas, sx, sy, width, height, 0, 0, width, height);
    context.restore();

    layer.invalid = false;
  });
}

/**
 * Internal API function to draw a composite image to a given enabled element
 *
 * @param {EnabledElement} enabledElement An enabled element to draw into
 * @param {Boolean} invalidated - true if pixel data has been invalidated and cached rendering should not be used
 * @returns {void}
 */
export default function (enabledElement, invalidated) {
  const element = enabledElement.element;
  const allLayers = getLayers(element);
  const activeLayer = getActiveLayer(element);
  const visibleLayers = getVisibleLayers(element);
  const resynced = !enabledElement.lastSyncViewportsState && enabledElement.syncViewports;

  // This state will help us to determine if the user has re-synced the
  // layers allowing us to make a new copy of the viewports
  enabledElement.lastSyncViewportsState = enabledElement.syncViewports;

  // Stores a copy of all viewports if the user has just synced them then we can use the
  // copies to calculate anything later (ratio, translation offset, rotation offset, etc)
  if (resynced) {
    allLayers.forEach(function (layer) {
      if (layer.viewport) {
        originalViewportScale[layer.layerId] = layer.viewport.scale;
      }
    });
  }

  // Sync all viewports in case it's activated
  if (enabledElement.syncViewports === true) {
    syncViewports(visibleLayers, activeLayer);
  }

  // Get the enabled element's canvas so we can draw to it
  const context = enabledElement.canvas.getContext('2d');

  context.setTransform(1, 0, 0, 1, 0, 0);

  // Clear the canvas
  context.fillStyle = 'black';
  context.fillRect(0, 0, enabledElement.canvas.width, enabledElement.canvas.height);

  // Render all visible layers
  renderLayers(context, visibleLayers, invalidated);
}
