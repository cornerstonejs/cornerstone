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
    function getDefaultViewport(enabledElement, image) {
        if(enabledElement === undefined) {
            throw "getDefaultViewport: parameter enabledElement must not be undefined";
        }
        if(image === undefined) {
            throw "getDefaultViewport: parameter image must not be undefined";
        }

        //quick and temporary hack for displayStaticImage() where we have no element
        var scale;
        if(!enabledElement){
            scale = 1;
        }
        else{
            var elemStyle =      window.getComputedStyle(enabledElement.element);

            var elWidth = parseInt(elemStyle.width);
            var elHeight =  parseInt(elemStyle.height);

            scale = scaleToFit(elWidth, elHeight, image.width, image.height);
        }

        var viewport = {
            scale : scale,
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

        return viewport;
    }

    function scaleToFit(elWidth, elHeight, imgWidth, imgHeight){
        return Math.min(elWidth / imgWidth, elHeight / imgHeight);
    }

    // module/private exports
    cornerstone.internal.getDefaultViewport = getDefaultViewport;
    cornerstone.getDefaultViewport = getDefaultViewport;

    cornerstone.internal.scaleToFit = scaleToFit;
}(cornerstone));
