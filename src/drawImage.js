/**
 * This module is responsible for drawing an image to an enabled elements canvas element
 */

var cornerstone = (function (cornerstone) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
    }

    var renderCanvas = document.createElement('canvas');
    var renderCanvasContext;
    var renderCanvasData;
    var lastRenderedImageId;
    var lastRenderedViewport = {};

    function initializeRenderCanvas(image)
    {
        // Resize the canvas
        renderCanvas.width = image.width;
        renderCanvas.height = image.height;

        // NOTE - we need to fill the render canvas with white pixels since we control the luminance
        // using the alpha channel to improve rendering performance.
        renderCanvasContext = renderCanvas.getContext('2d');
        renderCanvasContext.fillStyle = 'white';
        renderCanvasContext.fillRect(0,0, renderCanvas.width, renderCanvas.height);
        renderCanvasData = renderCanvasContext.getImageData(0,0,image.width, image.height);
    }

    function getLut(image, viewport)
    {
        // if we have a cached lut and it has the right values, return it immediately
        if(image.lut !== undefined &&
           image.lut.windowCenter === viewport.voi.windowCenter &&
            image.lut.windowWidth === viewport.voi.windowWidth &&
            image.lut.invert === viewport.invert) {
            return image.lut;
        }

        // lut is invalid or not present, regenerate it and cache it
        image.lut = cornerstone.generateLut(image, viewport.voi.windowWidth, viewport.voi.windowCenter, viewport.invert);
        image.lut.windowWidth = viewport.voi.windowWidth;
        image.lut.windowCenter = viewport.voi.windowCenter;
        image.lut.invert = viewport.invert;
        return image.lut;
    }

    function doesImageNeedToBeRendered(enabledElement, image)
    {
        if(image.imageId !== lastRenderedImageId ||
           lastRenderedViewport.windowCenter !== enabledElement.viewport.voi.windowCenter ||
           lastRenderedViewport.windowWidth !== enabledElement.viewport.voi.windowWidth ||
           lastRenderedViewport.invert !== enabledElement.viewport.invert)
        {
            return true;
        }

        return false;
    }

    /**
     * Internal API function to draw an image to a given enabled element
     * @param enabledElement
     * @param image
     */
    function drawImage(enabledElement) {
        if(enabledElement === undefined) {
            throw "drawImage: enabledElement parameter must not be undefined";
        }
        var image = enabledElement.image;
        if(image === undefined) {
            throw "drawImage: image must be loaded before it can be drawn";
        }

        var start = new Date();

        // get the canvas context and reset the transform
        var context = enabledElement.canvas.getContext('2d');
        context.setTransform(1, 0, 0, 1, 0, 0);

        // clear the canvas
        context.fillStyle = 'black';
        context.fillRect(0,0, enabledElement.canvas.width, enabledElement.canvas.height);

        // save the canvas context state and apply the viewport properties
        context.save();
        cornerstone.setToPixelCoordinateSystem(enabledElement, context);


        var currentRenderCanvas = renderCanvas;

        // check to see if the image in renderedCanvas needs to be rerendered or not
        if(doesImageNeedToBeRendered(enabledElement, image))
        {
            // If our render canvas does not match the size of this image reset it
            // NOTE: This might be inefficient if we are updating multiple images of different
            // sizes frequently.
            if(renderCanvas.width !== image.width || renderCanvas.height != image.height) {
                initializeRenderCanvas(image);
            }

            // get the lut to use
            var lut = getLut(image, enabledElement.viewport);

            // apply the lut to the stored pixel data onto the render canvas
            if(image.color) {
                if(enabledElement.viewport.voi.windowWidth === 256 &&
                   enabledElement.viewport.voi.windowCenter === 127 &&
                    enabledElement.viewport.invert === false)
                {
                    // the color image voi/invert has not been modified, request the canvas that contains
                    // it so we can draw it directly to the display canvas
                    currentRenderCanvas = image.getCanvas();
                }
                else
                {
                    // the color image voi/invert has been modified - apply the lut to the underlying
                    // pixel data and put it into the renderCanvas
                    cornerstone.storedColorPixelDataToCanvasImageData(image, lut, renderCanvasData.data);
                    renderCanvasContext.putImageData(renderCanvasData, 0, 0);
                }
            } else {
                // gray scale image - apply the lut and put the resulting image onto the render canvas
                cornerstone.storedPixelDataToCanvasImageData(image, lut, renderCanvasData.data);
                renderCanvasContext.putImageData(renderCanvasData, 0, 0);
            }

            lastRenderedImageId = image.imageId;
            lastRenderedViewport.windowCenter = enabledElement.viewport.voi.windowCenter;
            lastRenderedViewport.windowWidth = enabledElement.viewport.voi.windowWidth;
            lastRenderedViewport.invert = enabledElement.viewport.invert;
        }

        // turn off image smooth/interpolation if pixelReplication is set in the viewport
        if(enabledElement.viewport.pixelReplication === true) {
            context.imageSmoothingEnabled = false;
            context.mozImageSmoothingEnabled = false; // firefox doesn't support imageSmoothingEnabled yet
        }
        else {
            context.imageSmoothingEnabled = true;
            context.mozImageSmoothingEnabled = true;
        }

        // Draw the render canvas half the image size (because we set origin to the middle of the canvas above)
        context.drawImage(currentRenderCanvas, 0,0, image.width, image.height, 0, 0, image.width, image.height);

        context.restore();

        var end = new Date();
        var diff = end - start;
        cornerstone.lastRenderTimeInMs = diff;

        cornerstone.event(enabledElement, "CornerstoneImageRendered", {canvasContext: context});
    }

    // Module exports
    cornerstone.drawImage = drawImage;

    return cornerstone;
}(cornerstone));