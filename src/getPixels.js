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

        var mlutfn = cornerstone.internal.getModalityLUT(ee.image.slope, ee.image.intercept, ee.viewport.modalityLUT);

        var modalityPixels = storedPixels.map(mlutfn);

        return modalityPixels;
    }

    // module exports
    cornerstone.getPixels = getPixels;
}(cornerstone));