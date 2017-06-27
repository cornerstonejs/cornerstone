require('phantomjs-polyfill-find');
require('phantomjs-polyfill-find-index');

import guid from './internal/guid.js';
import { getEnabledElement } from './enabledElements.js';
import metaData from './metaData.js';
import getDefaultViewport from './internal/getDefaultViewport.js';
import updateImage from './updateImage.js';

/**
 * Helper function to trigger an event on a Cornerstone element with
 * a specific layerId
 *
 * @param {String} eventName The event name (e.g. CornerstoneLayerAdded)
 * @param {EnabledElement} enabledElement The Cornerstone enabled element
 * @param {String} layerId The layer's unique identifier
 * @returns {void}
 */
function triggerEvent (eventName, enabledElement, layerId) {
  const element = enabledElement.element;
  const eventData = {
    viewport: enabledElement.viewport,
    element: enabledElement.element,
    image: enabledElement.image,
    enabledElement,
    layerId
  };

  $(element).trigger(eventName, eventData);
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
 */
function rescaleImage (baseLayer, targetLayer) {
  const baseImage = baseLayer.image;
  const targetImage = targetLayer.image;

  // Return if these images don't have an imageId (e.g. for dynamic images)
  if (!baseImage.imageId || !targetImage.imageId) {
    return;
  }

  // TODO: Use row and column pixel spacing from image object
  const baseImagePlane = metaData.get('imagePlane', baseImage.imageId);
  const targetImagePlane = metaData.get('imagePlane', targetImage.imageId);

  if (!baseImagePlane || !baseImagePlane.columnPixelSpacing ||
      !targetImagePlane || !targetImagePlane.columnPixelSpacing) {
    return;
  }

  // Column pixel spacing need to be considered when calculating the
  // ratio between the layer added and base layer images
  const colRelative = (targetImagePlane.columnPixelSpacing * targetImage.width) /
                      (baseImagePlane.columnPixelSpacing * baseImage.width);
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
 */
export function addLayer (element, image, options) {
  const layerId = guid();
  const enabledElement = getEnabledElement(element);
  const layers = enabledElement.layers;
  const viewport = getDefaultViewport(enabledElement.canvas, image);

    // Set syncViewports to true by default when a new layer is added
  if (enabledElement.syncViewports !== false) {
    enabledElement.syncViewports = true;
  }

  const newLayer = {
    image,
    layerId,
    viewport,
    options: options || {}
  };

  // Rescale the new layer based on the base layer to make sure
  // they will have a proportional size (pixel spacing)
  if (layers.length) {
    rescaleImage(layers[0], newLayer);
  }

  layers.push(newLayer);

  // Set the layer as active if it's the first layer added
  if (layers.length === 1) {
    setActiveLayer(element, layerId);
  }

  triggerEvent('CornerstoneLayerAdded', enabledElement, layerId);

  return layerId;
}

/**
 * Remove a layer from a Cornerstone element given a layer ID
 *
 * @param {HTMLElement} element The DOM element enabled for Cornerstone
 * @param {String} layerId The unique identifier for the layer
 * @returns {void}
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

    triggerEvent('CornerstoneLayerRemoved', enabledElement, layerId);
  }
}

/**
 * Retrieve a layer from a Cornerstone element given a layer ID
 *
 * @param {HTMLElement} element The DOM element enabled for Cornerstone
 * @param {String} layerId The unique identifier for the layer
 * @return {EnabledElementLayer} The layer
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
 */
export function getLayers (element) {
  const enabledElement = getEnabledElement(element);


  return enabledElement.layers;
}

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

  enabledElement.activeLayerId = layerId;
  enabledElement.image = layer.image;
  enabledElement.viewport = layer.viewport;

  updateImage(element);
  triggerEvent('CornerstoneActiveLayerChanged', enabledElement, layerId);
}

/**
 * Retrieve the currently active layer for a Cornerstone element
 *
 * @param {HTMLElement} element The DOM element enabled for Cornerstone
 * @return {EnabledElementLayer} The currently active layer
 */
export function getActiveLayer (element) {
  const enabledElement = getEnabledElement(element);


  return enabledElement.layers.find((layer) => layer.layerId === enabledElement.activeLayerId);
}
