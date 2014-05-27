/**
 * This module contains a function to immediately invalidate an image
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
    function invalidateImageId(imageId) {

        var enabledElements = cornerstone.getEnabledElementsByImageId(imageId);
        enabledElements.forEach(function(enabledElement) {
            cornerstone.drawImage(enabledElement, true);
        });
    }

    // module exports
    cornerstone.invalidateImageId = invalidateImageId;

    return cornerstone;
}(cornerstone));