/**
 * This module contains a function to convert stored pixel values to display pixel values using a LUT
 */

export function storedColorPixelDataToCanvasImageData(image, lut, canvasImageDataData)
{
    var minPixelValue = image.minPixelValue;
    var canvasImageDataIndex = 0;
    var storedPixelDataIndex = 0;
    var numPixels = image.width * image.height * 4;
    var storedPixelData = image.getPixelData();
    var localLut = lut;
    var localCanvasImageDataData = canvasImageDataData;
    // NOTE: As of Nov 2014, most javascript engines have lower performance when indexing negative indexes.
    // We have a special code path for this case that improves performance.  Thanks to @jpambrun for this enhancement
    if(minPixelValue < 0){
        while(storedPixelDataIndex < numPixels) {
            localCanvasImageDataData[canvasImageDataIndex++] = localLut[storedPixelData[storedPixelDataIndex++] + (-minPixelValue)]; // red
            localCanvasImageDataData[canvasImageDataIndex++] = localLut[storedPixelData[storedPixelDataIndex++] + (-minPixelValue)]; // green
            localCanvasImageDataData[canvasImageDataIndex] = localLut[storedPixelData[storedPixelDataIndex] + (-minPixelValue)]; // blue
            storedPixelDataIndex+=2;
            canvasImageDataIndex+=2;
        }
    } else {
        while(storedPixelDataIndex < numPixels) {
            localCanvasImageDataData[canvasImageDataIndex++] = localLut[storedPixelData[storedPixelDataIndex++]]; // red
            localCanvasImageDataData[canvasImageDataIndex++] = localLut[storedPixelData[storedPixelDataIndex++]]; // green
            localCanvasImageDataData[canvasImageDataIndex] = localLut[storedPixelData[storedPixelDataIndex]]; // blue
            storedPixelDataIndex+=2;
            canvasImageDataIndex+=2;
        }
    }
}
