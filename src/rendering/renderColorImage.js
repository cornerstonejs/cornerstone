/**
 * This module is responsible for drawing an image to an enabled elements canvas element
 */

(function (cornerstone) {

    "use strict";

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

        var canvas = enabledElement.canvas,      
            context = canvas.getContext('2d');

        if(enabledElement.viewport.voi.windowWidth === image.windowWidth &&
            enabledElement.viewport.voi.windowCenter === image.windowCenter &&
            enabledElement.viewport.invert === false)
            // the color image voi/invert has not been modified, request the canvas that contains
            // it so we can draw it directly to the display canvas
            context.drawImage(image.getCanvas(), 0, 0);
        else{
            //may be faster to replace fillrect() and getImageData() with createImageData() and fill the alpha channel on storedColorPixelDataToCanvasImageData()
            context.fillStyle = "#000";
            context.fillRect(0, 0, canvas.width, canvas.height);
            var canvasData = context.getImageData(0, 0, canvas.width, canvas.height);
        
            cornerstone.storedColorPixelDataToCanvasImageData(
                image, 
                getLut(image, enabledElement.viewport, invalidated), 
                canvasData.data);
            
            context.putImageData(canvasData, 0, 0);
        }
      
    }

    // Module exports
    cornerstone.rendering.colorImage = renderColorImage;
    cornerstone.renderColorImage = renderColorImage;
}(cornerstone));
