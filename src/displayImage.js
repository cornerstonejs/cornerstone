/**
 * This module is responsible for enabling an element to display images with cornerstone
 */
(function ($, cornerstone) {

    "use strict";

    /**
     * sets a new image object for a given element
     * @param element
     * @param image
     */
    function displayImage(element, image, viewport) {
        if(element === undefined) {
            throw "displayImage: parameter element cannot be undefined";
        }
        if(image === undefined) {
            throw "displayImage: parameter image cannot be undefined";
        }

        var enabledElement = cornerstone.getEnabledElement(element);

        enabledElement.image = image;

        if(enabledElement.viewport === undefined) {
            enabledElement.viewport = cornerstone.internal.getDefaultViewport(enabledElement.canvas, image);
        }

        // merge viewport
        if(viewport) {
            for(var attrname in viewport)
            {
                if(viewport[attrname] !== null) {
                    enabledElement.viewport[attrname] = viewport[attrname];
                }
            }
        }

        var now = new Date();
        var frameRate;
        if(enabledElement.lastImageTimeStamp !== undefined) {
            var timeSinceLastImage = now.getTime() - enabledElement.lastImageTimeStamp;
            frameRate = (1000 / timeSinceLastImage).toFixed();
        } else {
        }
        enabledElement.lastImageTimeStamp = now.getTime();

        var newImageEventData = {
            viewport : enabledElement.viewport,
            element : enabledElement.element,
            image : enabledElement.image,
            enabledElement : enabledElement,
            frameRate : frameRate
        };

        $(enabledElement.element).trigger("CornerstoneNewImage", newImageEventData);

        cornerstone.updateImage(element);
    }

    /*
        Display statically and image into an existing canvas.
        Statically means 
            - we keep nothing on memory (no cache, no enabled element etc...)
            - we won't apply any changes on the image

        @param canvas
        @param image
        @param type  'adjustWidth', 'adjustHeight', 'fit' or undefined
            fit and undefined will do same things if no viewport is specified.
            If a viewport is set, fit will override viewport.scale to be sure it fits.
        @param viewport 
     */
    function displayStaticImage(canvas, image, type, viewport){
        if(canvas === undefined || image === undefined) {
            throw "displayStaticImage: parameters 'canvas' and 'image' cannot be undefined";
        }

        if(type == 'adjustWidth')
            canvas.width = canvas.height * image.width / image.height;
        else if(type == 'adjustHeight')
            canvas.height = canvas.width * image.height / image.width;

        var vp = cornerstone.internal.getDefaultViewport(canvas, image);
        if( viewport )
            $.extend(vp, viewport);
      
        if(type == 'fit' && viewport)
            vp.scale = cornerstone.internal.scaleToFit( canvas.width, canvas.height, image.width, image.height );

        cornerstone.internal.drawImage({
            canvas : canvas,
            viewport : vp,
            image: image
        });
    }

    /*
        return an <image> element
     */
    function getImageElement(srcImage, width, height, type, viewport){
        var canvas = document.createElement('canvas');
        canvas.width = width || srcImage.width;
        canvas.height = height || srcImage.height;

        displayStaticImage( canvas, srcImage, type, viewport);

        var img = document.createElement('img');
        img.src = canvas.toDataURL();

        return img;
    }

    // module/private exports
    cornerstone.displayImage = displayImage;
    cornerstone.displayStaticImage = displayStaticImage;
    cornerstone.getImageElement = getImageElement;

}($, cornerstone));