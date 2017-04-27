/**
 * This module contains a function to convert stored pixel values to display pixel values using a LUT
 */
(function (cornerstone) {

    "use strict";

    /**
     * This function transforms stored pixel values into a canvas image data buffer
     * by using a LUT.  This is the most performance sensitive code in cornerstone and
     * we use a special trick to make this go as fast as possible.  Specifically we
     * use the alpha channel only to control the luminance rather than the red, green and
     * blue channels which makes it over 3x faster.  The canvasImageDataData buffer needs
     * to be previously filled with white pixels.
     *
     * NOTE: Attribution would be appreciated if you use this technique!
     *
     * @param pixelData the pixel data
     * @param lut the lut
     * @param canvasImageDataData a canvasImgageData.data buffer filled with white pixels
     */
    function storedPixelDataToCanvasImageData(image, lut, canvasImageDataData)
    {
        var start = (window.performance ? performance.now() : Date.now());
        var pixelData = image.getPixelData();
        image.stats.lastGetPixelDataTime = (window.performance ? performance.now() : Date.now()) - start;

        var minPixelValue = image.minPixelValue;
        var canvasImageDataIndex = 3;
        var storedPixelDataIndex = 0;
        var numPixels = pixelData.length;

        start = (window.performance ? performance.now() : Date.now());
        // NOTE: As of Nov 2014, most javascript engines have lower performance when indexing negative indexes.
        // We have a special code path for this case that improves performance.  Thanks to @jpambrun for this enhancement

        // Added two paths (Int16Array, Uint16Array) to avoid polymorphic deoptimization in chrome.
        if (pixelData instanceof Int16Array) {
            if(minPixelValue < 0){
                while(storedPixelDataIndex < numPixels) {
                    canvasImageDataData[canvasImageDataIndex] = lut[pixelData[storedPixelDataIndex++] + (-minPixelValue)]; // alpha
                    canvasImageDataIndex += 4;
                }
            }else{
                while(storedPixelDataIndex < numPixels) {
                    canvasImageDataData[canvasImageDataIndex] = lut[pixelData[storedPixelDataIndex++]]; // alpha
                    canvasImageDataIndex += 4;
                }
            }
        }else if (pixelData instanceof Uint16Array){
            while(storedPixelDataIndex < numPixels) {
                canvasImageDataData[canvasImageDataIndex] = lut[pixelData[storedPixelDataIndex++]]; // alpha
                canvasImageDataIndex += 4;
            }
        }else{
            if(minPixelValue < 0){
                while(storedPixelDataIndex < numPixels) {
                    canvasImageDataData[canvasImageDataIndex] = lut[pixelData[storedPixelDataIndex++] + (-minPixelValue)]; // alpha
                    canvasImageDataIndex += 4;
                }
            }else{
                while(storedPixelDataIndex < numPixels) {
                    canvasImageDataData[canvasImageDataIndex] = lut[pixelData[storedPixelDataIndex++]]; // alpha
                    canvasImageDataIndex += 4;
                }
            }
        }
        image.stats.laststoredPixelDataToCanvasImageDataTime = (window.performance ? performance.now() : Date.now()) - start;
    }

    // Module exports
    cornerstone.internal.storedPixelDataToCanvasImageData = storedPixelDataToCanvasImageData;
    cornerstone.storedPixelDataToCanvasImageData = storedPixelDataToCanvasImageData;

}(cornerstone));
