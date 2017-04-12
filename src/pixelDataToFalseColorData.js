(function(cornerstone) {

    "use strict";

    /**
     * Converts the image pixel data into a false color data
     *
     * @param image
     * @param lookupTable
     */
    function pixelDataToFalseColorData(image, lookupTable) {
        if (image.color && !image.falseColor) {
            throw "Color transforms are not implemented yet";
        }

        var minPixelValue = image.minPixelValue;
        var canvasImageDataIndex = 0;
        var storedPixelDataIndex = 0;
        var numPixels = image.width * image.height;
        var origPixelData = image.origPixelData || image.getPixelData();
        var storedColorPixelData = new Uint8Array(numPixels * 4);
        var localLookupTable = lookupTable;
        var sp, mapped;

        image.color = true;
        image.falseColor = true;
        image.origPixelData = origPixelData;
        
        if (lookupTable instanceof cornerstone.colors.LookupTable) {
            lookupTable.build();
            
            while (storedPixelDataIndex < numPixels) {
                sp = origPixelData[storedPixelDataIndex++];
                mapped = lookupTable.mapValue(sp);
                storedColorPixelData[canvasImageDataIndex++] = mapped[0];
                storedColorPixelData[canvasImageDataIndex++] = mapped[1];
                storedColorPixelData[canvasImageDataIndex++] = mapped[2];
                storedColorPixelData[canvasImageDataIndex++] = mapped[3];
            }
        } else {
            if (minPixelValue < 0) {
                while (storedPixelDataIndex < numPixels) {
                    sp = origPixelData[storedPixelDataIndex++];
                    storedColorPixelData[canvasImageDataIndex++] = localLookupTable[sp + (-minPixelValue)][0]; // red
                    storedColorPixelData[canvasImageDataIndex++] = localLookupTable[sp + (-minPixelValue)][1]; // green
                    storedColorPixelData[canvasImageDataIndex++] = localLookupTable[sp + (-minPixelValue)][2]; // blue
                    storedColorPixelData[canvasImageDataIndex++] = localLookupTable[sp + (-minPixelValue)][3]; // alpha
                }
            } else {
                while (storedPixelDataIndex < numPixels) {
                    sp = origPixelData[storedPixelDataIndex++];
                    storedColorPixelData[canvasImageDataIndex++] = localLookupTable[sp][0]; // red
                    storedColorPixelData[canvasImageDataIndex++] = localLookupTable[sp][1]; // green
                    storedColorPixelData[canvasImageDataIndex++] = localLookupTable[sp][2]; // blue
                    storedColorPixelData[canvasImageDataIndex++] = localLookupTable[sp][3]; // alpha
                }
            }

        }

        image.rgba = true;
        image.lut = undefined;
        image.slope = 1;
        image.minPixelValue = 0;
        image.maxPixelValue = 255;
        image.windowWidth = 255;
        image.windowCenter = 128;
        image.getPixelData = function() {
            return storedColorPixelData;
        };
    }

    cornerstone.pixelDataToFalseColorData = pixelDataToFalseColorData;

}(cornerstone));