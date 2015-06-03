/**
 * This module will fit an image to fit inside the canvas displaying it such that all pixels
 * in the image are viewable
 */
(function (cornerstone) {

    "use strict";

    /**
     * Adjusts an images scale and center so the image is centered and completely visible
     * @param element
     */
    function fitToWindow(element)
    {
        var enabledElement = cornerstone.getEnabledElement(element);
        var defaultViewport = cornerstone.internal.getDefaultViewport(enabledElement.canvas, enabledElement.image);
        enabledElement.viewport.scale = defaultViewport.scale;
        enabledElement.viewport.translation.x = defaultViewport.translation.x;
        enabledElement.viewport.translation.y = defaultViewport.translation.y;
        enabledElement.viewport.rotation = defaultViewport.rotation;
        enabledElement.viewport.hflip = defaultViewport.hflip;
        enabledElement.viewport.vflip = defaultViewport.vflip;
        cornerstone.updateImage(element);
    }

    cornerstone.fitToWindow = fitToWindow;
}(cornerstone));
