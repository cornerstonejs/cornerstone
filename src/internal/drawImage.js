/**
 * This module is responsible for drawing an image to an enabled elements canvas element
 */

(function ($, cornerstone) {

    "use strict";

    /**
     * Internal API function to draw an image to a given enabled element
     * @param enabledElement
     * @param invalidated - true if pixel data has been invalidated and cached rendering should not be used
     */
    function drawImage(enabledElement, invalidated) {
        enabledElement.needsRedraw = true;
        if (invalidated){
            enabledElement.invalid = true;
        }

    }

    /**
     * Draw an image to a given enabled element in a sychronous way
     * @param enabledElement
     * @param invalidated - true if pixel data has been invalidated and cached rendering should not be used
     */
    function drawImageSync(enabledElement, invalidated) {
        var image = enabledElement.image;
        var layers = enabledElement.layers || [];

        // Check if enabledElement can be redrawn
        if (!enabledElement.canvas || !(enabledElement.image || layers.length)){
            return;
        }

        // Start measuring the time needed to draw the image/layers
        var start = new Date();

        if (layers && layers.length) {
            cornerstone.drawCompositeImage(enabledElement, invalidated);
        } else if (image) {
            var render = image.render;

            if(!render) {
                render = image.color ? cornerstone.renderColorImage : cornerstone.renderGrayscaleImage;
            }

            render(enabledElement, invalidated);
        }

        // Calculate how long it took to draw the image/layers
        var end = new Date();
        var diff = end - start;
        var context = enabledElement.canvas.getContext('2d');

        var eventData = {
            viewport: enabledElement.viewport,
            element: enabledElement.element,
            image: enabledElement.image,
            enabledElement: enabledElement,
            canvasContext: context,
            renderTimeInMs: diff
        };

        $(enabledElement.element).trigger("CornerstoneImageRendered", eventData);
    }

    // Module exports
    cornerstone.internal.drawImage = drawImage;
    cornerstone.drawImage = drawImage;
    cornerstone.drawImageSync = drawImageSync;

}($, cornerstone));