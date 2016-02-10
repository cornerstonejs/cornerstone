/**
 * This module is responsible for drawing a grayscale imageß
 */

(function (cornerstone) {

    "use strict";

    function lutMatches(a, b) {
      // if undefined, they are equal
      if(!a && !b) {
        return true;
      }
      // if one is undefined, not equal
      if(!a || !b) {
        return false;
      }
      // check the unique ids
      return (a.id !== b.id)
    }

    function getLut(image, viewport, invalidated)
    {
        // if we have a cached lut and it has the right values, return it immediately
        if(image.lut !== undefined &&
            image.lut.windowCenter === viewport.voi.windowCenter &&
            image.lut.windowWidth === viewport.voi.windowWidth &&
            lutMatches(image.lut.modalityLUT, viewport.modalityLUT) &&
            lutMatches(image.lut.voiLUT, viewport.voiLUT) &&
            image.lut.invert === viewport.invert &&
            invalidated !== true) {
            return image.lut;
        }

        // lut is invalid or not present, regenerate it and cache it
        //seems hacky for the moment but we need to invert the invert value. We are drawing white on black 
        cornerstone.generateLut(image, viewport.voi.windowWidth, viewport.voi.windowCenter, !viewport.invert, viewport.modalityLUT, viewport.voiLUT);
        image.lut.windowWidth = viewport.voi.windowWidth;
        image.lut.windowCenter = viewport.voi.windowCenter;
        image.lut.invert = viewport.invert;
        image.lut.voiLUT = viewport.voiLUT;
        image.lut.modalityLUT = viewport.modalityLUT;
        return image.lut;
    }

    /**
     * API function to draw a grayscale image to a given enabledElement
     * @param enabledElement
     * @param invalidated - true if pixel data has been invaldiated and cached rendering should not be used
     */
    function renderGrayscaleImage(enabledElement, invalidated) {

        if(enabledElement === undefined) {
            throw "drawImage: enabledElement parameter must not be undefined";
        }
        var image = enabledElement.image;
        if(image === undefined) {
            throw "drawImage: image must be loaded before it can be drawn";
        }

        /* There is a bug when applying transform on canvas with chrome/chromium (most likely all webkit/blink browsers) 
         @see https://code.google.com/p/chromium/issues/detail?id=562973
         So depending on how this bug will be handled we may need to revert back drawing black on white this means 
            - fill all bytes of imageData (rgba) 
            or 
            - use a second canvas and do c2.fillRect() -> c2.getImageData() -> c2.putImageData() -> c1.drawImage(c2)
        */
        var canvas = enabledElement.canvas,      
            context = canvas.getContext('2d'),
            canvasData = context.createImageData(canvas.width, canvas.height);

        cornerstone.storedPixelDataToCanvasImageData(
            image, 
            getLut(image, enabledElement.viewport, invalidated), 
            canvasData.data);
        
        context.putImageData(canvasData, 0, 0);
    }

    // Module exports
    cornerstone.rendering.grayscaleImage = renderGrayscaleImage;
    cornerstone.renderGrayscaleImage = renderGrayscaleImage;

}(cornerstone));
