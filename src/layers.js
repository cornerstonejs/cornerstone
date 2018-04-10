import guid from './internal/guid.js';
import { getEnabledElement } from './enabledElements.js';
import getDefaultViewport from './internal/getDefaultViewport.js';
import updateImage from './updateImage.js';
import triggerCustomEvent from './triggerEvent.js';
import EVENTS from './events.js';

/**
 * @module EnabledElementLayers
 */

/**
 * Helper function to trigger an event on a Cornerstone element with
 * a specific layerId
 *
 * @param {String} eventName The event name (e.g. CornerstoneLayerAdded)
 * @param {EnabledElement} enabledElement The Cornerstone enabled element
 * @param {String} layerId The layer's unique identifier
 * @returns {void}
 * @memberof EnabledElementLayers
 */
function triggerEventForLayer (eventName, enabledElement, layerId) {
  const element = enabledElement.element;
  const eventData = {
    viewport: enabledElement.viewport,
    element: enabledElement.element,
    image: enabledElement.image,
    enabledElement,
    layerId
  };

  triggerCustomEvent(element, eventName, eventData);
}

/**
 * Rescale the target layer to the base layer based on the
 * relative size of each image and their pixel dimensions.
 *
 * This function will update the Viewport parameters of the
 * target layer to a new scale.
 *
 * @param {EnabledElementLayer} baseLayer The base layer
 * @param {EnabledElementLayer} targetLayer The target layer to rescale
 * @returns {void}
 * @memberof EnabledElementLayers
 */
export function rescaleImage (baseLayer, targetLayer) {
  if (baseLayer.layerId === targetLayer.layerId) {
    throw new Error('rescaleImage: both arguments represent the same layer');
  }

  const baseImage = baseLayer.image;
  const targetImage = targetLayer.image;

  // Return if these images don't have an imageId (e.g. for dynamic images)
  if (!baseImage.imageId || !targetImage.imageId) {
    return;
  }

  // Column pixel spacing need to be considered when calculating the
  // ratio between the layer added and base layer images
  const colRelative = (targetLayer.viewport.displayedArea.columnPixelSpacing * targetImage.width) /
                      (baseLayer.viewport.displayedArea.columnPixelSpacing * baseImage.width);
  const viewportRatio = targetLayer.viewport.scale / baseLayer.viewport.scale * colRelative;

  targetLayer.viewport.scale = baseLayer.viewport.scale * viewportRatio;
}

/**
 * Add a layer to a Cornerstone element
 *
 * @param {HTMLElement} element The DOM element enabled for Cornerstone
 * @param {Image} image A Cornerstone Image object to add as a new layer
 * @param {Object} options Options for the layer
 *
 * @returns {String} layerId The new layer's unique identifier
 * @memberof EnabledElementLayers
 */
export function addLayer (element, image, options) {
  const layerId = guid();
  const enabledElement = getEnabledElement(element);
  const layers = enabledElement.layers;
  let viewport;

  if (image) {
    viewport = getDefaultViewport(enabledElement.canvas, image);

    // Override the defaults if any optional viewport settings
    // have been specified
    if (options && options.viewport) {
      viewport = Object.assign(viewport, options.viewport);
    }
  }

  // Set syncViewports to true by default when a new layer is added
  if (enabledElement.syncViewports !== false) {
    enabledElement.syncViewports = true;
  }

  const newLayer = {
    image,
    layerId,
    viewport,
    options: options || {},
    renderingTools: {}
  };

  // Rescale the new layer based on the base layer to make sure
  // they will have a proportional size (pixel spacing)
  if (layers.length && image) {
    rescaleImage(layers[0], newLayer);
  }

  layers.push(newLayer);

  triggerEventForLayer(EVENTS.LAYER_ADDED, enabledElement, layerId);

  // Set the layer as active if it's the first layer added
  if (layers.length === 1 && image) {
    setActiveLayer(element, layerId);
  }

  return layerId;
}

/**
 * Remove a layer from a Cornerstone element given a layer ID
 *
 * @param {HTMLElement} element The DOM element enabled for Cornerstone
 * @param {String} layerId The unique identifier for the layer
 * @returns {void}
 * @memberof EnabledElementLayers
 */
export function removeLayer (element, layerId) {
  const enabledElement = getEnabledElement(element);
  const layers = enabledElement.layers;
  const index = enabledElement.layers.findIndex((layer) => layer.layerId === layerId);

  if (index !== -1) {
    layers.splice(index, 1);

    // If the current layer is active, and we have other layers,
    // switch to the first layer that remains in the array
    if (layerId === enabledElement.activeLayerId && layers.length) {
      setActiveLayer(element, layers[0].layerId);
    }

    triggerEventForLayer(EVENTS.LAYER_REMOVED, enabledElement, layerId);
  }
}

/**
 * Retrieve a layer from a Cornerstone element given a layer ID
 *
 * @param {HTMLElement} element The DOM element enabled for Cornerstone
 * @param {String} layerId The unique identifier for the layer
 * @return {EnabledElementLayer} The layer
 * @memberof EnabledElementLayers
 */
export function getLayer (element, layerId) {
  const enabledElement = getEnabledElement(element);


  return enabledElement.layers.find((layer) => layer.layerId === layerId);
}

/**
 * Retrieve all layers for a Cornerstone element
 *
 * @param {HTMLElement} element The DOM element enabled for Cornerstone
 *
 * @return {EnabledElementLayer[]} An array of layers
 * @memberof EnabledElementLayers
 */
export function getLayers (element) {
  const enabledElement = getEnabledElement(element);


  return enabledElement.layers;
}

/**
 * Retrieve all visible layers for a Cornerstone element
 *
 * @param {HTMLElement} element The DOM element enabled for Cornerstone
 *
 * @return {EnabledElementLayer[]} An array of layers
 * @memberof EnabledElementLayers
 */
export function getVisibleLayers (element) {
  const enabledElement = getEnabledElement(element);

  return enabledElement.layers.filter((layer) => layer.options &&
               layer.options.visible !== false &&
               layer.options.opacity !== 0);
}

/**
 * Set the active layer for a Cornerstone element
 *
 * @param {HTMLElement} element The DOM element enabled for Cornerstone
 * @param {String} layerId The unique identifier for the layer
 * @returns {void}
 * @memberof EnabledElementLayers
 */
export function setActiveLayer (element, layerId) {
  const enabledElement = getEnabledElement(element);

  // Stop here if this layer is already active
  if (enabledElement.activeLayerId === layerId) {
    return;
  }

  const index = enabledElement.layers.findIndex((layer) => layer.layerId === layerId);

  if (index === -1) {
    throw new Error('setActiveLayer: layer not found in layers array');
  }

  const layer = enabledElement.layers[index];

  if (!layer.image) {
    throw new Error('setActiveLayer: layer with undefined image cannot be set as active.');
  }

  enabledElement.activeLayerId = layerId;
  enabledElement.image = layer.image;
  enabledElement.viewport = layer.viewport;

  updateImage(element);
  triggerEventForLayer(EVENTS.ACTIVE_LAYER_CHANGED, enabledElement, layerId);
}

/**
 * Set a new image for a specific layerId
 *
 * @param {HTMLElement} element The DOM element enabled for Cornerstone
 * @param {Image} image The image to be displayed in this layer
 * @param {String} [layerId] The unique identifier for the layer
 * @returns {void}
 * @memberof EnabledElementLayers
 */
export function setLayerImage (element, image, layerId) {
  const enabledElement = getEnabledElement(element);
  const baseLayer = enabledElement.layers[0];

  let layer;

  if (layerId) {
    layer = getLayer(element, layerId);
  } else {
    layer = getActiveLayer(element);
  }

  if (!layer) {
    throw new Error('setLayerImage: Layer not found');
  }

  layer.image = image;

  if (!image) {
    layer.viewport = undefined;

    return;
  }

  if (!layer.viewport) {
    const defaultViewport = getDefaultViewport(enabledElement.canvas, image);

    // Override the defaults if any optional viewport settings
    // have been specified
    if (layer.options && layer.options.viewport) {
      layer.viewport = Object.assign(defaultViewport, layer.options.viewport);
    }

    if (baseLayer.layerId !== layerId) {
      rescaleImage(baseLayer, layer);
    }
  }
}

/**
 * Retrieve the currently active layer for a Cornerstone element
 *
 * @param {HTMLElement} element The DOM element enabled for Cornerstone
 * @return {EnabledElementLayer} The currently active layer
 * @memberof EnabledElementLayers
 */
export function getActiveLayer (element) {
  const enabledElement = getEnabledElement(element);


  return enabledElement.layers.find((layer) => layer.layerId === enabledElement.activeLayerId);
}
