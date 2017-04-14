/**
 * This module is responsible for drawing an image to an enabled elements canvas element
 */

(function ($, cornerstone) {

    "use strict";

    // This is used to keep each of the layers' viewports in sync with the active layer
    var syncedViewports = {};

    // Create a copy of the properties that will be cached when syncing viewports
    function cloneViewport(viewport) {
        return {
            rotation: viewport.rotation,
            scale: viewport.scale,
            translation: {
                x: viewport.translation.x,
                y: viewport.translation.y
            }
        }
    }

    function getDrawImageOffset(targetImageId, referenceImageId) {
        var offset = {
            x: 0,
            y: 0
        };

        var targetImagePlane = cornerstone.metaData.get('imagePlane', targetImageId);
        if (!targetImagePlane ||
            !targetImagePlane.imagePositionPatient ||
            !targetImagePlane.rowCosines ||
            !targetImagePlane.columnCosines) {
            return offset;
        }

        var referenceImagePlane = cornerstone.metaData.get('imagePlane', referenceImageId);
        if (!referenceImagePlane ||
            !referenceImagePlane.imagePositionPatient ||
            !referenceImagePlane.rowCosines ||
            !referenceImagePlane.columnCosines) {
            return offset;
        }

        // TODO: Add Image Orientation check between layers
        var pos = targetImagePlane.imagePositionPatient;
        var origPos = referenceImagePlane.imagePositionPatient

        // UNCOMMENT THESE LINES AFTER FIXING IT
        // offset.x = pos.x - origPos.x;
        // offset.y = pos.y - origPos.y;

        return offset;
    }


    // Sync all viewports based on active layer's viewport
    function syncViewports(layers, activeLayer) {
        // If we intend to keep the viewport's scale, translation and rotation in sync,
        // loop through the layers 
        layers.forEach(function(layer, index) {
            // Don't do anything to the active layer
            if (layer === activeLayer) {
                return;
            }

            var activeLayerSyncedViewport = syncedViewports[activeLayer.layerId];
            var currentLayerSyncedViewport = syncedViewports[layer.layerId];
            var viewportRatio = currentLayerSyncedViewport.scale / activeLayerSyncedViewport.scale;

            // Update the layer's translation and scale to keep them in sync with the first image
            // based on the ratios between the images
            layer.viewport.scale = activeLayer.viewport.scale * viewportRatio;
            layer.viewport.rotation = activeLayer.viewport.rotation;
            layer.viewport.translation = {
                x: (activeLayer.viewport.translation.x / viewportRatio),
                y: (activeLayer.viewport.translation.y / viewportRatio)
            };
        });
    }

    function renderLayers(context, activeLayer, layers, invalidated) {
        var canvas = context.canvas;

        // Loop through each layer and draw it to the canvas
        layers.forEach(function(layer, index) {
            context.save();

            // Set the layer's canvas to the pixel coordinate system
            layer.canvas = canvas;
            cornerstone.setToPixelCoordinateSystem(layer, context);

            // Convert the image to false color image if layer.options.colormap
            // exists or try to restore the original pixel data otherwise
            var pixelDataUpdated;
            if(layer.options.colormap) {
                pixelDataUpdated = cornerstone.convertImageToFalseColorImage(layer.image, layer.options.colormap);
            } else {
                pixelDataUpdated = cornerstone.restoreImage(layer.image);
            }

            // If the image got updated it needs to be re-rendered
            invalidated = invalidated || pixelDataUpdated;

            // Render into the layer's canvas
            if (layer.image.color === true) {
                cornerstone.addColorLayer(layer, invalidated);
            } else {
                cornerstone.addGrayscaleLayer(layer, invalidated);
            }

            // Apply any global opacity settings that have been defined for this layer
            if (layer.options && layer.options.opacity) {
                context.globalAlpha = layer.options.opacity;
            } else {
                context.globalAlpha = 1;
            }

            // Calculate any offset between the position of the active layer and the current layer
            var offset = getDrawImageOffset(layer.image.imageId, activeLayer.image.imageId);

            // Draw from the current layer's canvas onto the enabled element's canvas
            context.drawImage(layer.canvas, 0, 0, layer.image.width, layer.image.height, offset.x, offset.y, layer.image.width, layer.image.height);

            context.restore();
        });
    }

    /**
     * Internal API function to draw a composite image to a given enabled element
     * @param enabledElement
     * @param invalidated - true if pixel data has been invalidated and cached rendering should not be used
     */
    function drawCompositeImage(enabledElement, invalidated) {
        var element = enabledElement.element;
        var allLayers = cornerstone.getLayers(element);
        var activeLayer = cornerstone.getActiveLayer(element);
        var visibleLayers = cornerstone.getVisibleLayers(element);
        var resynced = !enabledElement.lastSyncViewportsState && enabledElement.syncViewports;

        // This state will help us to determine if the user has re-synced the
        // layers allowing us to make a new copy of the viewports
        enabledElement.lastSyncViewportsState = enabledElement.syncViewports;

        // Stores a copy of all viewports if the user has just synced them then we can use the
        // copies to calculate anything later (ratio, translation offset, rotation offset, etc)
        if(resynced) {
            allLayers.forEach(function(layer) {
                syncedViewports[layer.layerId] = cloneViewport(layer.viewport);
            });
        }

        // Sync all viewports in case it's activated
        if (enabledElement.syncViewports === true) {
            syncViewports(visibleLayers, activeLayer);
        }

        // Get the enabled element's canvas so we can draw to it
        var context = enabledElement.canvas.getContext('2d');
        context.setTransform(1, 0, 0, 1, 0, 0);

        // Clear the canvas
        context.fillStyle = 'black';
        context.fillRect(0, 0, enabledElement.canvas.width, enabledElement.canvas.height);

        // Render all visible layers
        renderLayers(context, activeLayer, visibleLayers, invalidated);
    }

    // Module exports
    cornerstone.internal.drawCompositeImage = drawCompositeImage;
    cornerstone.drawCompositeImage = drawCompositeImage;

}($, cornerstone));