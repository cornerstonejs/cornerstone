/**
 * This module contains a function to convert stored pixel values to display pixel values using a LUT
 */
(function (cornerstone) {

    "use strict";

    function storedColorPixelDataToCanvasImageData(image, lut, canvasImageDataData)
    {

        var start = (window.performance ? performance.now() : Date.now());
        var pixelData = image.getPixelData();
        image.stats.lastGetPixelDataTime = (window.performance ? performance.now() : Date.now()) - start;


        start = (window.performance ? performance.now() : Date.now());
        var minPixelValue = image.minPixelValue;
        var canvasImageDataIndex = 0;
        var storedPixelDataIndex = 0;
        var numPixels = pixelData.length;

        // NOTE: As of Nov 2014, most javascript engines have lower performance when indexing negative indexes.
        // We have a special code path for this case that improves performance.  Thanks to @jpambrun for this enhancement
        if(minPixelValue < 0){
            while(storedPixelDataIndex < numPixels) {
                canvasImageDataData[canvasImageDataIndex++] = lut[pixelData[storedPixelDataIndex++] + (-minPixelValue)]; // red
                canvasImageDataData[canvasImageDataIndex++] = lut[pixelData[storedPixelDataIndex++] + (-minPixelValue)]; // green
                canvasImageDataData[canvasImageDataIndex] = lut[pixelData[storedPixelDataIndex] + (-minPixelValue)]; // blue
                storedPixelDataIndex+=2;
                canvasImageDataIndex+=2;
            }
        }else{
            while(storedPixelDataIndex < numPixels) {
                canvasImageDataData[canvasImageDataIndex++] = lut[pixelData[storedPixelDataIndex++]]; // red
                canvasImageDataData[canvasImageDataIndex++] = lut[pixelData[storedPixelDataIndex++]]; // green
                canvasImageDataData[canvasImageDataIndex] = lut[pixelData[storedPixelDataIndex]]; // blue
                storedPixelDataIndex+=2;
                canvasImageDataIndex+=2;
            }
        }
        image.stats.laststoredPixelDataToCanvasImageDataTime = (window.performance ? performance.now() : Date.now()) - start;
    }

    // Module exports
    cornerstone.internal.storedColorPixelDataToCanvasImageData = storedColorPixelDataToCanvasImageData;
    cornerstone.storedColorPixelDataToCanvasImageData = storedColorPixelDataToCanvasImageData;

}(cornerstone));
