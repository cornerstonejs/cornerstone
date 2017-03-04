/**
 * This module is responsible for enabling an element to display images with cornerstone
 */
(function (cornerstone) {

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

        var event = new CustomEvent("CornerstoneNewImage", {detail: newImageEventData});
        enabledElement.element.dispatchEvent(event);

        cornerstone.updateImage(element);
    }

    // module/private exports
    cornerstone.displayImage = displayImage;
}(cornerstone));
