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

        enabledElement.viewport.scale = viewport.scale;
        enabledElement.viewport.translation.x = viewport.translation.x;
        enabledElement.viewport.translation.y = viewport.translation.y;
        enabledElement.viewport.voi.windowWidth = viewport.voi.windowWidth;
        enabledElement.viewport.voi.windowCenter = viewport.voi.windowCenter;
        enabledElement.viewport.invert = viewport.invert;
        enabledElement.viewport.pixelReplication = viewport.pixelReplication;

        // prevent window width from being < 1
        if(enabledElement.viewport.voi.windowWidth < 1) {
            enabledElement.viewport.voi.windowWidth = 1;
        }
        // prevent scale from getting too small
        if(enabledElement.viewport.scale < 0.0001) {
            enabledElement.viewport.scale = 0.25;
        }

        // Force the image to be updated since the viewport has been modified
        cornerstone.updateImage(element);
    }

    /**
     * Returns the viewport for the specified enabled element
     * @param element
     * @returns {*}
     */
    function getViewport(element) {
        var enabledElement = cornerstone.getEnabledElement(element);

        var viewport = enabledElement.viewport;
        if(viewport === undefined) {
            return undefined;
        }
        return {
            scale : viewport.scale,
            translation : {
                x : viewport.translation.x,
                y : viewport.translation.y
            },
            voi : {
                windowWidth: viewport.voi.windowWidth,
                windowCenter : viewport.voi.windowCenter
            },
            invert : viewport.invert,
            pixelReplication: viewport.pixelReplication
        };
    }


    // module/private exports
    cornerstone.getViewport = getViewport;
    cornerstone.setViewport=setViewport;

    return cornerstone;
}(cornerstone));