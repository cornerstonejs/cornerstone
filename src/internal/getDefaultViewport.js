/**
 * This module contains a function to get a default viewport for an image given
 * a canvas element to display it in
 *
 */
(function (cornerstone) {

    "use strict";

    /**
     * Creates a new viewport object containing default values for the image and canvas
     * @param canvas
     * @param image
     * @returns viewport object
     */
    function getDefaultViewport(canvas, image) {
        if(canvas === undefined) {
            throw "getDefaultViewport: parameter canvas must not be undefined";
        }
        if(image === undefined) {
            throw "getDefaultViewport: parameter image must not be undefined";
        }
        var viewport = {
            scale : 1.0,
            translation : {
                x : 0,
                y : 0
            },
            voi : {
                windowWidth: image.windowWidth,
                windowCenter: image.windowCenter,
            },
            invert: image.invert,
            pixelReplication: false,
            rotation: 0,
            hflip: false,
            vflip: false,
            modalityLUT: image.modalityLUT,
            voiLUT: image.voiLUT
        };

        // fit image to window   
        viewport.scale = cornerstone.internal.scaleToFit( canvas.width, canvas.height, image.columns, image.rows );
        
        return viewport;
    }

    // module/private exports
    cornerstone.internal.getDefaultViewport = getDefaultViewport;
    cornerstone.getDefaultViewport = getDefaultViewport;
}(cornerstone));
