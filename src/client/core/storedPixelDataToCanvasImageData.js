var cornerstoneCore = (function (cornerstoneCore) {

    "use strict";

    if(cornerstoneCore === undefined) {
        cornerstoneCore = {};
    }

    /**
     * This function transforms stored pixel values into a canvas image data buffer
     * by using a LUT.  This is the most performance sensitive code in cornerstone and
     * we use a special trick to make this go as fast as possible.  Specifically we
     * use the alpha channel only to control the luminance rather than the red, green and
     * blue channels which makes it over 3x faster.  The canvasImageDataData buffer needs
     * to be previously filled with white pixels.
     *
     * @param image the image object
     * @param lut the lut
     * @param canvasImageDataData a canvasImgageData.data buffer filled with white pixels
     */
    function storedPixelDataToCanvasImageData(image, lut, canvasImageDataData)
    {
        var canvasImageDataIndex = 3;
        var storedPixelDataIndex = 0;
        var numPixels = image.width * image.height;
        var storedPixelData = image.storedPixelData;
        var localLut = lut;
        var localCanvasImageDataData = canvasImageDataData;
        while(storedPixelDataIndex < numPixels) {
            localCanvasImageDataData[canvasImageDataIndex] = localLut[storedPixelData[storedPixelDataIndex++]]; // alpha
            canvasImageDataIndex += 4;
        }
    }

    // Module exports
    cornerstoneCore.storedPixelDataToCanvasImageData = storedPixelDataToCanvasImageData;

   return cornerstoneCore;
}(cornerstoneCore));