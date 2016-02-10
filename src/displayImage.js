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
        var hasSizeChanged = false;

        if(enabledElement.image === undefined)
             //TODO could do better
            //What we want is to set canvas background only once we start displaying images
            // Doing it at enable() is too soon (create a white rect during image load)
            // Doing it at each drawImage() call seems too much
            //Here we kinda do it at first displayImage
            enabledElement.canvas.style.backgroundColor = '#fff';

        enabledElement.image = image;

        if(enabledElement.viewport === undefined)
            enabledElement.viewport = cornerstone.internal.getDefaultViewport(enabledElement, image);

        // merge viewport
        if(viewport) {
            for(var attrname in viewport)
            {
                if(viewport[attrname] !== null) {
                    enabledElement.viewport[attrname] = viewport[attrname];
                }
            }
        }

        if(enabledElement.canvas.width != image.width){
            enabledElement.canvas.width = image.width;
            hasSizeChanged = true;
        }
        if(enabledElement.canvas.height != image.height){
            enabledElement.canvas.height = image.height;
            hasSizeChanged = true;
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

        if( viewport || hasSizeChanged )
            cornerstone.updateTransform(element);  

        cornerstone.updateImage(element);
    }

    // module/private exports
    cornerstone.displayImage = displayImage;

}($, cornerstone));