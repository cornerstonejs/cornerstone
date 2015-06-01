
(function(csc) {
    module("cornerstoneCore.storedPixelDataToCanvasImageData");

    test("storedPixelDataToCanvasImageData minPixel = 0", function() {
        // Arrange
        var lut = [0,255];
        var canvasImageDataData = [255,255,255,128, 255,255,255,128];
        var image = {
            minPixelValue : 0,
            maxPixelValue: 1,
            width: 1,
            height: 2,
            getPixelData : function() {return [0,1];}
        };

        // Act
        csc.storedPixelDataToCanvasImageData(image, lut, canvasImageDataData);

        // Assert
        equal(canvasImageDataData[0], 255, "R1");
        equal(canvasImageDataData[1], 255, "G1");
        equal(canvasImageDataData[2], 255, "B1");
        equal(canvasImageDataData[3], 0, "A1");
        equal(canvasImageDataData[4], 255, "R2");
        equal(canvasImageDataData[5], 255, "G2");
        equal(canvasImageDataData[6], 255, "B2");
        equal(canvasImageDataData[7], 255, "A2");
    });

    test("storedPixelDataToCanvasImageData minPixel < 0", function() {
        // Arrange
        var lut = [0,255];
        var canvasImageDataData = [255,255,255,128, 255,255,255,128];
        var image = {
            minPixelValue : -1,
            maxPixelValue: 0,
            width: 1,
            height: 2,
            getPixelData : function() {return [-1,0];}
        };

        // Act
        csc.storedPixelDataToCanvasImageData(image, lut, canvasImageDataData);

        // Assert
        equal(canvasImageDataData[0], 255, "R1");
        equal(canvasImageDataData[1], 255, "G1");
        equal(canvasImageDataData[2], 255, "B1");
        equal(canvasImageDataData[3], 0, "A1");
        equal(canvasImageDataData[4], 255, "R2");
        equal(canvasImageDataData[5], 255, "G2");
        equal(canvasImageDataData[6], 255, "B2");
        equal(canvasImageDataData[7], 255, "A2");
    });

    test("storedPixelDataToCanvasImageData minPixel > 0", function() {
        // Arrange
        var lut = [];
        lut[1] = 0;
        lut[2] = 255;
        var canvasImageDataData = [255,255,255,128, 255,255,255,128];
        var image = {
            minPixelValue : 1,
            maxPixelValue: 2,
            width: 1,
            height: 2,
            getPixelData : function() {return [1,2];}
        };

        // Act
        csc.storedPixelDataToCanvasImageData(image, lut, canvasImageDataData);

        // Assert
        equal(canvasImageDataData[0], 255, "R1");
        equal(canvasImageDataData[1], 255, "G1");
        equal(canvasImageDataData[2], 255, "B1");
        equal(canvasImageDataData[3], 0, "A1");
        equal(canvasImageDataData[4], 255, "R2");
        equal(canvasImageDataData[5], 255, "G2");
        equal(canvasImageDataData[6], 255, "B2");
        equal(canvasImageDataData[7], 255, "A2");
    });

})(cornerstone);