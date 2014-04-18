/**
 * This module is responsible for drawing an image to an enabled elements canvas element
 */

var cornerstone = (function (cornerstone) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
    }

    var grayscaleRenderCanvas = document.createElement('canvas');
    var grayscaleRenderCanvasContext;
    var grayscaleRenderCanvasData;

    var colorRenderCanvas = document.createElement('canvas');
    var colorRenderCanvasContext;
    var colorRenderCanvasData;

    var lastRenderedImageId;
    var lastRenderedViewport = {};

    function initializeGrayscaleRenderCanvas(image)
    {
        // Resize the canvas
        grayscaleRenderCanvas.width = image.width;
        grayscaleRenderCanvas.height = image.height;

        // NOTE - we need to fill the render canvas with white pixels since we control the luminance
        // using the alpha channel to improve rendering performance.
        grayscaleRenderCanvasContext = grayscaleRenderCanvas.getContext('2d');
        grayscaleRenderCanvasContext.fillStyle = 'white';
        grayscaleRenderCanvasContext.fillRect(0,0, grayscaleRenderCanvas.width, grayscaleRenderCanvas.height);
        grayscaleRenderCanvasData = grayscaleRenderCanvasContext.getImageData(0,0,image.width, image.height);
    }

    function initializeColorRenderCanvas(image)
    {
        // Resize the canvas
        colorRenderCanvas.width = image.width;
        colorRenderCanvas.height = image.height;

        // get the canvas data so we can write to it directly
        colorRenderCanvasContext = colorRenderCanvas.getContext('2d');
        colorRenderCanvasContext.fillStyle = 'white';
        colorRenderCanvasContext.fillRect(0,0, colorRenderCanvas.width, colorRenderCanvas.height);
        colorRenderCanvasData = colorRenderCanvasContext.getImageData(0,0,image.width, image.height);
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
        cornerstone.generateLut(image, viewport.voi.windowWidth, viewport.voi.windowCenter, viewport.invert);
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

    function getRenderCanvas(enabledElement, image)
    {
        // apply the lut to the stored pixel data onto the render canvas
        if(image.color) {

            if(enabledElement.viewport.voi.windowWidth === 256 &&
                enabledElement.viewport.voi.windowCenter === 127 &&
                enabledElement.viewport.invert === false)
            {
                // the color image voi/invert has not been modified, request the canvas that contains
                // it so we can draw it directly to the display canvas
                return image.getCanvas();
            }
            else
            {
                if(doesImageNeedToBeRendered(enabledElement, image) === false) {
                    return colorRenderCanvas;
                }

                // If our render canvas does not match the size of this image reset it
                // NOTE: This might be inefficient if we are updating multiple images of different
                // sizes frequently.
                if(colorRenderCanvas.width !== image.width || colorRenderCanvas.height != image.height) {
                    initializeColorRenderCanvas(image);
                }

                // get the lut to use
                var colorLut = getLut(image, enabledElement.viewport);

                // the color image voi/invert has been modified - apply the lut to the underlying
                // pixel data and put it into the renderCanvas
                cornerstone.storedColorPixelDataToCanvasImageData(image, colorLut, colorRenderCanvasData.data);
                colorRenderCanvasContext.putImageData(colorRenderCanvasData, 0, 0);
                return colorRenderCanvas;
            }
        } else {

            if(doesImageNeedToBeRendered(enabledElement, image) === false) {
                return grayscaleRenderCanvas;
            }


            // If our render canvas does not match the size of this image reset it
            // NOTE: This might be inefficient if we are updating multiple images of different
            // sizes frequently.
            if(grayscaleRenderCanvas.width !== image.width || grayscaleRenderCanvas.height != image.height) {
                initializeGrayscaleRenderCanvas(image);
            }

            // get the lut to use
            var lut = getLut(image, enabledElement.viewport);

            // gray scale image - apply the lut and put the resulting image onto the render canvas
            cornerstone.storedPixelDataToCanvasImageData(image, lut, grayscaleRenderCanvasData.data);
            grayscaleRenderCanvasContext.putImageData(grayscaleRenderCanvasData, 0, 0);
            return grayscaleRenderCanvas;
        }
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

        var renderCanvas = getRenderCanvas(enabledElement, image);

        lastRenderedImageId = image.imageId;
        lastRenderedViewport.windowCenter = enabledElement.viewport.voi.windowCenter;
        lastRenderedViewport.windowWidth = enabledElement.viewport.voi.windowWidth;
        lastRenderedViewport.invert = enabledElement.viewport.invert;

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
        context.drawImage(renderCanvas, 0,0, image.width, image.height, 0, 0, image.width, image.height);

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