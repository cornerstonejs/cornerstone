/**
 * This module will fit an image to fit inside the canvas displaying it such that all pixels
 * in the image are viewable
 */
var cornerstone = (function (cornerstone) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
    }

    /**
     * Adjusts an images scale and center so the image is centered and completely visible
     * @param element
     */
    function fitToWindow(element)
    {
        var enabledElement = cornerstone.getEnabledElement(element);
        var defaultViewport = cornerstone.getDefaultViewport(enabledElement.canvas, enabledElement.image);
        enabledElement.viewport.scale = defaultViewport.scale;
        enabledElement.viewport.translation.x = defaultViewport.translation.x;
        enabledElement.viewport.translation.y = defaultViewport.translation.y;
        cornerstone.updateImage(element);
    }

    cornerstone.fitToWindow = fitToWindow;

    return cornerstone;
}(cornerstone));