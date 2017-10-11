import { getLayers, getActiveLayer, getVisibleLayers } from '../layers.js';
import { addColorLayer } from '../rendering/renderColorImage.js';
import { addGrayscaleLayer } from '../rendering/renderGrayscaleImage.js';
import { convertImageToFalseColorImage, restoreImage } from '../falseColorMapping.js';
import setToPixelCoordinateSystem from '../setToPixelCoordinateSystem.js';

// This is used to keep each of the layers' viewports in sync with the active layer
const syncedViewports = {};

// Create a copy of the properties that will be cached when syncing viewports
function cloneViewport (viewport) {
  return {
    rotation: viewport.rotation,
    scale: viewport.scale,
    translation: {
      x: viewport.translation.x,
      y: viewport.translation.y
    },
    hflip: viewport.hflip,
    vflip: viewport.vflip
  };
}


// Sync all viewports based on active layer's viewport
function syncViewports (layers, activeLayer) {
  // If we intend to keep the viewport's scale, translation and rotation in sync,
  // loop through the layers
  layers.forEach((layer) => {
    // Don't do anything to the active layer
    if (layer === activeLayer) {
      return;
    }

    const activeLayerSyncedViewport = syncedViewports[activeLayer.layerId];
    const currentLayerSyncedViewport = syncedViewports[layer.layerId] || layer.viewport;
    const viewportRatio = currentLayerSyncedViewport.scale / activeLayerSyncedViewport.scale;

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
 * @param {EnabledElementLayer} activeLayer The active layer
 * @param {EnabledElementLayer[]} layers The array of all layers for this enabled element
 * @param {Boolean} invalidated A boolean whether or not this image has been invalidated and must be redrawn
 * @returns {void}
 */
function renderLayers (context, activeLayer, layers, invalidated) {
  const canvas = context.canvas;

  // Loop through each layer and draw it to the canvas
  layers.forEach((layer) => {
    context.save();

    if (!layer.image) {
      return;
    }

    // Set the layer's canvas to the pixel coordinate system
    layer.canvas = canvas;
    setToPixelCoordinateSystem(layer, context);

    // Convert the image to false color image if layer.options.colormap
    // exists or try to restore the original pixel data otherwise
    let pixelDataUpdated;

    if (layer.options.colormap && layer.image.colormapId !== layer.options.colormap) {
      // If the options for this layer specify a colormap, but the image
      // in the layer does not yet have this colormap set, convert
      // the pixel data to this colormap and update the viewport.
      pixelDataUpdated = convertImageToFalseColorImage(layer.image, layer.options.colormap);
      layer.viewport.voi = {
        windowWidth: layer.image.windowWidth,
        windowCenter: layer.image.windowCenter
      };
    } else if (!layer.options.colormap && layer.image.colormapId) {
      // If the image for this layer still has a colormapId, but the
      // colormap has been removed from the options for this layer,
      // undo the conversion from the original pixel data to the false
      // color mapped pixel data and update the viewport.
      pixelDataUpdated = restoreImage(layer.image);
      layer.viewport.voi = {
        windowWidth: layer.image.windowWidth,
        windowCenter: layer.image.windowCenter
      };
    }

    // If the image got updated it needs to be re-rendered
    invalidated = invalidated || pixelDataUpdated;

    // Render into the layer's canvas
    if (layer.image.color === true) {
      addColorLayer(layer, invalidated);
    } else {
      addGrayscaleLayer(layer, invalidated);
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
    if (layer.viewport.pixelReplication === true) {
      context.imageSmoothingEnabled = false;
      context.mozImageSmoothingEnabled = false;
    } else {
      context.imageSmoothingEnabled = true;
      context.mozImageSmoothingEnabled = true;
    }

    // Draw from the current layer's canvas onto the enabled element's canvas
    context.drawImage(layer.canvas, 0, 0, layer.image.width, layer.image.height, 0, 0, layer.image.width, layer.image.height);

    context.restore();
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
      syncedViewports[layer.layerId] = cloneViewport(layer.viewport);
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
  renderLayers(context, activeLayer, visibleLayers, invalidated);
}
