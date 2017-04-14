/**
 * This module is responsible for drawing an image to an enabled elements canvas element
 */

(function (cornerstone) {

    "use strict";

    function ensuresRenderingTools(enabledElement) {
        if (!enabledElement.renderingTools) {
            enabledElement.renderingTools = {};
        }
    }

    function initializeColorRenderCanvas(enabledElement, image)
    {
        var colorRenderCanvas = enabledElement.renderingTools.colorRenderCanvas;
        // Resize the canvas
        colorRenderCanvas.width = image.width;
        colorRenderCanvas.height = image.height;

        // get the canvas data so we can write to it directly
        var colorRenderCanvasContext = colorRenderCanvas.getContext('2d');
        colorRenderCanvasContext.fillStyle = 'white';
        colorRenderCanvasContext.fillRect(0,0, colorRenderCanvas.width, colorRenderCanvas.height);
        var colorRenderCanvasData = colorRenderCanvasContext.getImageData(0,0,image.width, image.height);
        
        enabledElement.renderingTools.colorRenderCanvasContext = colorRenderCanvasContext;
        enabledElement.renderingTools.colorRenderCanvasData = colorRenderCanvasData;
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
        var lastRenderedImageId = enabledElement.renderingTools.lastRenderedImageId;
        var lastRenderedViewport = enabledElement.renderingTools.lastRenderedViewport;
        
        if(image.imageId !== lastRenderedImageId ||
            lastRenderedViewport.windowCenter !== enabledElement.viewport.voi.windowCenter ||
            lastRenderedViewport.windowWidth !== enabledElement.viewport.voi.windowWidth ||
            lastRenderedViewport.invert !== enabledElement.viewport.invert ||
            lastRenderedViewport.rotation !== enabledElement.viewport.rotation ||  
            lastRenderedViewport.hflip !== enabledElement.viewport.hflip ||
            lastRenderedViewport.vflip !== enabledElement.viewport.vflip
            )
        {
            return true;
        }

        return false;
    }

    function getRenderCanvas(enabledElement, image, invalidated)
    {
        if (!enabledElement.renderingTools.colorRenderCanvas) {
            enabledElement.renderingTools.colorRenderCanvas = document.createElement('canvas');
        }

        var colorRenderCanvas = enabledElement.renderingTools.colorRenderCanvas;
        
        // The ww/wc is identity and not inverted - get a canvas with the image rendered into it for
        // fast drawing
        if(enabledElement.viewport.voi.windowWidth === 255 &&
            enabledElement.viewport.voi.windowCenter === 128 &&
            enabledElement.viewport.invert === false &&
            image.getCanvas &&
            image.getCanvas()
        )
        {
            return image.getCanvas();
        }

        // apply the lut to the stored pixel data onto the render canvas
        if(doesImageNeedToBeRendered(enabledElement, image) === false && invalidated !== true) {
            return colorRenderCanvas;
        }

        // If our render canvas does not match the size of this image reset it
        // NOTE: This might be inefficient if we are updating multiple images of different
        // sizes frequently.
        if(colorRenderCanvas.width !== image.width || colorRenderCanvas.height !== image.height) {
            initializeColorRenderCanvas(enabledElement, image);
        }

        // get the lut to use
        var colorLut = getLut(image, enabledElement.viewport);

        var colorRenderCanvasData = enabledElement.renderingTools.colorRenderCanvasData;
        var colorRenderCanvasContext = enabledElement.renderingTools.colorRenderCanvasContext;
        // the color image voi/invert has been modified - apply the lut to the underlying
        // pixel data and put it into the renderCanvas
        cornerstone.storedColorPixelDataToCanvasImageData(image, colorLut, colorRenderCanvasData.data);
        colorRenderCanvasContext.putImageData(colorRenderCanvasData, 0, 0);
        return colorRenderCanvas;
    }

    /**
     * API function to render a color image to an enabled element
     * @param enabledElement
     * @param invalidated - true if pixel data has been invaldiated and cached rendering should not be used
     */
    function renderColorImage(enabledElement, invalidated) {

        if(enabledElement === undefined) {
            throw "drawImage: enabledElement parameter must not be undefined";
        }
        var image = enabledElement.image;
        if(image === undefined) {
            throw "drawImage: image must be loaded before it can be drawn";
        }

        // get the canvas context and reset the transform
        var context = enabledElement.canvas.getContext('2d');
        context.setTransform(1, 0, 0, 1, 0, 0);

        // clear the canvas
        context.fillStyle = 'black';
        context.fillRect(0,0, enabledElement.canvas.width, enabledElement.canvas.height);

        // turn off image smooth/interpolation if pixelReplication is set in the viewport
        if(enabledElement.viewport.pixelReplication === true) {
            context.imageSmoothingEnabled = false;
            context.mozImageSmoothingEnabled = false; // firefox doesn't support imageSmoothingEnabled yet
        }
        else {
            context.imageSmoothingEnabled = true;
            context.mozImageSmoothingEnabled = true;
        }

        // save the canvas context state and apply the viewport properties
        context.save();
        cornerstone.setToPixelCoordinateSystem(enabledElement, context);

        ensuresRenderingTools(enabledElement);

        var renderCanvas;
        if (enabledElement.options && enabledElement.options.renderer &&
            enabledElement.options.renderer.toLowerCase() === 'webgl') {
            // If this enabled element has the option set for WebGL, we should
            // user it as our renderer.
            renderCanvas = cornerstone.webGL.renderer.render(enabledElement);
        } else {
            // If no options are set we will retrieve the renderCanvas through the
            // normal Canvas rendering path
            renderCanvas = getRenderCanvas(enabledElement, image, invalidated);
        }

        context.drawImage(renderCanvas, 0,0, image.width, image.height, 0, 0, image.width, image.height);

        context.restore();

        enabledElement.renderingTools.lastRenderedImageId = image.imageId;
        var lastRenderedViewport = {};
        lastRenderedViewport.windowCenter = enabledElement.viewport.voi.windowCenter;
        lastRenderedViewport.windowWidth = enabledElement.viewport.voi.windowWidth;
        lastRenderedViewport.invert = enabledElement.viewport.invert;
        lastRenderedViewport.rotation = enabledElement.viewport.rotation;
        lastRenderedViewport.hflip = enabledElement.viewport.hflip;
        lastRenderedViewport.vflip = enabledElement.viewport.vflip;
        enabledElement.renderingTools.lastRenderedViewport = lastRenderedViewport;
    }

    function addColorLayer(layer, invalidated) {
        if(layer === undefined) {
            throw "drawImage: layer parameter must not be undefined";
        }

        var image = layer.image;
        if(image === undefined) {
            throw "drawImage: image must be loaded before it can be drawn";
        }

        ensuresRenderingTools(layer);

        layer.canvas = getRenderCanvas(layer, image, invalidated);
        var context = layer.canvas.getContext('2d');

        // turn off image smooth/interpolation if pixelReplication is set in the viewport
        if(layer.viewport.pixelReplication === true) {
            context.imageSmoothingEnabled = false;
            context.mozImageSmoothingEnabled = false; // firefox doesn't support imageSmoothingEnabled yet
        } else {
            context.imageSmoothingEnabled = true;
            context.mozImageSmoothingEnabled = true;
        }

        layer.renderingTools.lastRenderedImageId = image.imageId;
        var lastRenderedViewport = {};
        lastRenderedViewport.windowCenter = layer.viewport.voi.windowCenter;
        lastRenderedViewport.windowWidth = layer.viewport.voi.windowWidth;
        lastRenderedViewport.invert = layer.viewport.invert;
        lastRenderedViewport.rotation = layer.viewport.rotation;
        lastRenderedViewport.hflip = layer.viewport.hflip;
        lastRenderedViewport.vflip = layer.viewport.vflip;
        layer.renderingTools.lastRenderedViewport = lastRenderedViewport;
    }

    // Module exports
    cornerstone.rendering.colorImage = renderColorImage;
    cornerstone.renderColorImage = renderColorImage;
    cornerstone.addColorLayer = addColorLayer;
}(cornerstone));
