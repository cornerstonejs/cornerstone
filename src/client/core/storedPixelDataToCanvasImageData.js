var cornerstoneCore = (function (cornerstoneCore) {
    if(cornerstoneCore === undefined) {
        cornerstoneCore = {};
    }

    function storedPixelDataToCanvasImageData(image, lut, canvasImageDataData)
    {
        var canvasImageDataIndex = 0;
        var storedPixelDataIndex = 0;
        for(var row=0; row < image.rows; row++) {
            for(var column=0; column< image.columns; column++) {
                var storedPixelValue = image.storedPixelData[storedPixelDataIndex++];
                var value = lut[storedPixelValue];
                canvasImageDataData[canvasImageDataIndex++] = value; // red
                canvasImageDataData[canvasImageDataIndex++] = value; // green
                canvasImageDataData[canvasImageDataIndex++] = value; // blue
                canvasImageDataData[canvasImageDataIndex++] = 255; // alpha
            }
        }
    };

    // Module exports
    cornerstoneCore.storedPixelDataToCanvasImageData = storedPixelDataToCanvasImageData;

   return cornerstoneCore;
}(cornerstoneCore));