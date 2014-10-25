/**
 * This module contains a function to immediately redraw an image
 */
var cornerstone = (function (cornerstone) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
    }

    /**
     * Forces the image to be updated/redrawn for the specified enabled element
     * @param element
     */
    function updateImage(element, invalidated) {
        var enabledElement = cornerstone.getEnabledElement(element);

        if(enabledElement.image === undefined) {
            throw "updateImage: image has not been loaded yet";
        }

        cornerstone.drawImage(enabledElement, invalidated);
    }

    // module exports
    cornerstone.updateImage = updateImage;

    return cornerstone;
}(cornerstone));