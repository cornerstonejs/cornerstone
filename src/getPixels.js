/**
 * This module returns a subset of the stored pixels of an image
 */
(function (cornerstone) {

    "use strict";


    /**
     * Returns array of pixels with modality LUT transformation applied
     */
    function getPixels(element, x, y, width, height) {

        var storedPixels = cornerstone.getStoredPixels(element, x, y, width, height);
        var ee = cornerstone.getEnabledElement(element);
        var slope = ee.image.slope;
        var intercept = ee.image.intercept;

        var modalityPixels = storedPixels.map(function(pixel){
            return pixel * slope + intercept;
        });

        return modalityPixels;
    }

    // module exports
    cornerstone.getPixels = getPixels;
}(cornerstone));