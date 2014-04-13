/**
 * This module contains a function to get a default viewport for an image given
 * a canvas element to display it in
 *
 */
var cornerstone = (function (cornerstone) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
    }

    /**
     * Creates a new viewport object containing default values for the image and canvas
     * @param canvas
     * @param image
     * @returns {{scale: number, centerX: number, centerY: number, windowWidth: (image.windowWidth|*), windowCenter: (image.windowCenter|*), invert: *}}
     */
    function getDefaultViewport(canvas, image) {
        var viewport = {
            scale : 1.0,
            centerX : 0,
            centerY: 0,
            windowWidth: image.windowWidth,
            windowCenter: image.windowCenter,
            invert: image.invert,
            pixelReplication: false
        };

        // fit image to window
        var verticalScale = canvas.height / image.rows;
        var horizontalScale= canvas.width / image.columns;
        if(horizontalScale < verticalScale) {
            viewport.scale = horizontalScale;
        }
        else {
            viewport.scale = verticalScale;
        }
        return viewport;
    }

    // module/private exports
    cornerstone.getDefaultViewport = getDefaultViewport;

    return cornerstone;
}(cornerstone));