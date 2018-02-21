import { getEnabledElement } from './enabledElements.js';
import updateImage from './updateImage.js';

/**
 * Retrieves the height of the image, depending on the viewport orientation
 *
 * @param {Viewport} viewport - Object containing the viewport properties
 * @param {Object} image An Image loaded by a Cornerstone Image Loader
 * @returns {Number} The Image height
 */
function getDisplayedHeight (viewport, image) {
  if (viewport.rotation === 0 || viewport.rotation === 180) {
    return image.height;
  }

  return image.width;
}

/**
 * Retrieves the width of the image, depending on the viewport orientation
 *
 * @param {Viewport} viewport - Object containing the viewport properties
 * @param {Object} image An Image loaded by a Cornerstone Image Loader
 * @returns {Number} The Image width
 */
function getDisplayedWidth (viewport, image) {
  if (viewport.rotation === 0 || viewport.rotation === 180) {
    return image.width;
  }

  return image.height;
}

/**
 * Retrieves the scale ratio to display targetImage with same dimensions as baseImage
 *
 * @param {Object} baseImage An Image loaded by a Cornerstone Image Loader
 * @param {Object} targetImage An Image loaded by a Cornerstone Image Loader
 * @returns {Number} The scale ratio
 */
function getScaleRatio (baseImage, targetImage) {
  if (targetImage === undefined || !targetImage.columnPixelSpacing || baseImage === undefined || !baseImage.columnPixelSpacing) {
    return 1;
  }

  return targetImage.columnPixelSpacing / baseImage.columnPixelSpacing;
}

function selectSmallestLayer (enabledElement, layers) {
  if (!layers || !layers.length) {
    return;
  }

  let verticalRatio, horizontalRatio, layerScale, viewportScale, largestViewportScale, smallestLayer;

  layers.forEach((layer) => {
    if (layer.image === undefined) {
      return;
    }
    verticalRatio = enabledElement.canvas.height / getDisplayedHeight(enabledElement.viewport, layer.image);
    horizontalRatio = enabledElement.canvas.width / getDisplayedWidth(enabledElement.viewport, layer.image);
    layerScale = Math.min(horizontalRatio, verticalRatio);
    viewportScale = layerScale * getScaleRatio(layer.image, enabledElement.image);

    if (largestViewportScale === undefined || largestViewportScale < viewportScale) {
      largestViewportScale = viewportScale;
      smallestLayer = layer;
    }
  });

  return smallestLayer.layerId;
}

/**
 * Adjusts an image's scale and translation so the image is centered and all pixels
 * in the image (or in the layer baseLayerId if defined) are viewable.
 *
 * @param {HTMLElement} element The Cornerstone element to update
 * @param {String} [baseLayerFilter] Filter to select the layer to fit to window
 * @returns {void}
 */
export default function (element, baseLayerFilter) {
  const enabledElement = getEnabledElement(element);
  const layers = enabledElement.layers || [];

  let baseLayer, baseLayerId;
  let baseImage = enabledElement.image;

  if (baseLayerFilter !== undefined) {
    switch (baseLayerFilter) {
    case 'smallest':
      // Select the smallest layer
      baseLayerId = selectSmallestLayer(enabledElement, layers);
      break;

      // Filter is a layerId
    default:
      baseLayerId = baseLayerFilter;
    }
  }

  if (baseLayerId !== undefined) {
    baseLayer = layers.find((layer) => layer.layerId === baseLayerId);
  }

  if (baseLayer !== undefined) {
    baseImage = baseLayer.image;
  }

  // The new scale is the minimum of the horizontal and vertical scale values
  const verticalRatio = enabledElement.canvas.height / getDisplayedHeight(enabledElement.viewport, baseImage);
  const horizontalRatio = enabledElement.canvas.width / getDisplayedWidth(enabledElement.viewport, baseImage);
  const baseImageScale = Math.min(horizontalRatio, verticalRatio);

  // Rescale the viewport
  enabledElement.viewport.scale = baseImageScale * getScaleRatio(baseImage, enabledElement.image);
  enabledElement.viewport.translation.x = 0;
  enabledElement.viewport.translation.y = 0;

  updateImage(element);
}
