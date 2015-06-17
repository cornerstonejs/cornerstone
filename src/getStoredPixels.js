/**
 * This module returns a subset of the stored pixels of an image
 */
(function (cornerstone) {

    "use strict";

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
        var spIndex,
            row,
            column;

        if (ee.image.color) {
            for(row=0; row < height; row++) {
                for(column=0; column < width; column++) {
                    spIndex = (((row + y) * ee.image.columns) + (column + x)) * 4;
                    var red = pixelData[spIndex];
                    var green = pixelData[spIndex + 1];
                    var blue = pixelData[spIndex + 2];
                    storedPixels[index++] = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
                }
            }
        } else {
            for(row=0; row < height; row++) {
                for(column=0; column < width; column++) {
                    spIndex = ((row + y) * ee.image.columns) + (column + x);
                    storedPixels[index++] = pixelData[spIndex];
                }
            }
        }
        return storedPixels;
    }

    // module exports
    cornerstone.getStoredPixels = getStoredPixels;
}(cornerstone));