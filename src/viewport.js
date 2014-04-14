/**
 * This module contains functions to deal with getting and setting the viewport for an enabled element
 */
var cornerstone = (function (cornerstone) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
    }

    function setViewport(element, viewport) {

        var enabledElement = cornerstone.getEnabledElement(element);

        // prevent window width from being < 1
        if(viewport.voi.windowWidth < 1) {
            viewport.voi.windowWidth = 1;
        }
        // prevent scale from getting too small
        if(viewport.scale < 0.0001) {
            viewport.scale = 0.25;
        }

        enabledElement.viewport = viewport;

        // Force the image to be updated since the viewport has been modified
        cornerstone.updateImage(element);

        cornerstone.event(enabledElement, "CornerstoneViewportUpdated");
    }

    /**
     * Returns the viewport for the specified enabled element
     * @param element
     * @returns {*}
     */
    function getViewport(element) {
        return cornerstone.getEnabledElement(element).viewport;
    }

    // module/private exports
    cornerstone.getViewport = getViewport;
    cornerstone.setViewport=setViewport;

    return cornerstone;
}(cornerstone));