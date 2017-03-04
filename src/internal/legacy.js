/**
 * This module is responsible for drawing an image to an enabled elements canvas element
 */

(function (cornerstone) {

    "use strict";

    cornerstone.drawImage = cornerstone.internal.drawImage;
    cornerstone.generateLut = cornerstone.internal.generateLut;
    cornerstone.storedPixelDataToCanvasImageData = cornerstone.internal.storedPixelDataToCanvasImageData;
    cornerstone.storedColorPixelDataToCanvasImageData = cornerstone.internal.storedColorPixelDataToCanvasImageData;

}(cornerstone));
