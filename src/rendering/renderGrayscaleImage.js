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

        /* ----- Annotation ------ */
        /*
        var canvasAnnot = enabledElement.canvasAnnot,
            cxtAnnot = canvasAnnot.getContext('2d'),

            rotation = enabledElement.viewport.rotation*Math.PI/180,
            scaleX = (enabledElement.viewport.hflip? -1 : 1)*enabledElement.viewport.scale,
            scaleY = (enabledElement.viewport.vflip? -1 : 1)*enabledElement.viewport.scale;

        cxtAnnot.setTransform(1, 0, 0, 1, 0, 0);
        cxtAnnot.clearRect(0, 0, canvasAnnot.width, canvasAnnot.height);

        cxtAnnot.strokeStyle = 'white';
        cxtAnnot.fillStyle = 'white';
        cxtAnnot.font = "12pt Arial";
        cxtAnnot.textBaseline = "bottom";
        cxtAnnot.textAlign = "left";

        //translate to center for rotate/scale
        cxtAnnot.translate(enabledElement.viewport.translation.x + canvasAnnot.width/2, enabledElement.viewport.translation.y + canvasAnnot.height/2);
        cxtAnnot.scale(scaleX, scaleY);
        cxtAnnot.rotate(rotation);

        //go to top left of image (from center)
        cxtAnnot.translate(-image.width/2, -image.height/2);


        //shape
        cxtAnnot.save();
        
        var scaleAdjust = 0.5/enabledElement.viewport.scale;
        
        cxtAnnot.beginPath();        
        cxtAnnot.rect(128 + scaleAdjust, 90 + scaleAdjust, 50, 60);

        cxtAnnot.setTransform(1, 0, 0, 1, 0, 0);
        cxtAnnot.stroke();

        cxtAnnot.restore();

        //text
        var x = 128 + scaleAdjust,
            y = 90 + scaleAdjust,
            width = 50,
            height = 60,

            width2 =  width/2,
            height2 = height/2, 

            cos = Math.abs(Math.cos(rotation)),
            sin = Math.abs(Math.sin(rotation)),
            rectHalfSize = {
                x: cos*width2 + sin*height2,
                y: sin*width2 + cos*height2
            },

            text = 'Tumor Here',
            textX = -rectHalfSize.x,
            textY = -rectHalfSize.y;
    
        //unrotate and unflip from center of bounding rectangle
        cxtAnnot.translate(x + width2, y + height2);
        cxtAnnot.rotate(-rotation);
        cxtAnnot.scale(enabledElement.viewport.hflip? -1 : 1, enabledElement.viewport.vflip? -1 : 1);

        //scale down at start of text
        cxtAnnot.translate( textX, textY);
        cxtAnnot.scale(1/enabledElement.viewport.scale, 1/enabledElement.viewport.scale);

        //draw text (still at start of text)
        cxtAnnot.fillText(text, 0, 0);
        */
    }

    // Module exports
    cornerstone.rendering.grayscaleImage = renderGrayscaleImage;
    cornerstone.renderGrayscaleImage = renderGrayscaleImage;

}(cornerstone));
