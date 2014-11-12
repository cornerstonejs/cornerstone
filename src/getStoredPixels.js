/**
 * This module returns a subset of the stored pixels of an image
 */
var cornerstone = (function (cornerstone) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
    }

    /**
     * Returns an array of stored pixels given a rectangle in the image
     * @param element
     * @param x
     * @param y
     * @param width
     * @param height
     * @returns {Array}
     */
    function getStoredPixels(element, x, y, width, height) {
        if(element === undefined) {
            throw "getStoredPixels: parameter element must not be undefined";
        }

        x = Math.round(x);
        y = Math.round(y);
        var ee = cornerstone.getEnabledElement(element);
        var storedPixels = [];
        var index = 0;
        var pixelData = ee.image.getPixelData();
        for(var row=0; row < height; row++) {
            for(var column=0; column < width; column++) {
                var spIndex = ((row + y) * ee.image.columns) + (column + x);
                storedPixels[index++] = pixelData[spIndex];
            }
        }
        return storedPixels;
    }

    /**
     * Returns array of pixels with modality LUT transformation applied
     */
    function getPixels(element, x, y, width, height) {

        var storedPixels = getStoredPixels(element, x, y, width, height);
        var ee = cornerstone.getEnabledElement(element);
        var slope = ee.image.slope;
        var intercept = ee.image.intercept;

        var modalityPixels = storedPixels.map(function(pixel){
                return pixel * slope + intercept;
            });

        return modalityPixels;
    }

    // module exports
    cornerstone.getStoredPixels = getStoredPixels;
    cornerstone.getPixels = getPixels;

    return cornerstone;
}(cornerstone));