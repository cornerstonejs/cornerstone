
(function(csc) {
    module("cornerstoneCore.storedPixelDataToCanvasImageData");

    test("storedPixelDataToCanvasImageData", function() {
        // Arrange
        var lut = [0,128,255];
        var canvasImageDataData = [];
        var image = {
            storedPixelData: [0,1,2],
            rows: 1,
            columns: 3
        };

        // Act
        csc.storedPixelDataToCanvasImageData(image, lut, canvasImageDataData);

        // Assert
        equal(canvasImageDataData[0], 0, "R");
        equal(canvasImageDataData[1], 0, "G");
        equal(canvasImageDataData[2], 0, "B");
        equal(canvasImageDataData[3], 255, "A");
        equal(canvasImageDataData[4], 128, "");
        equal(canvasImageDataData[5], 128, "");
        equal(canvasImageDataData[6], 128, "");
        equal(canvasImageDataData[7], 255, "");
        equal(canvasImageDataData[8], 255, "");
        equal(canvasImageDataData[9], 255, "");
        equal(canvasImageDataData[10], 255, "");
        equal(canvasImageDataData[11], 255, "");
    });


})(cornerstoneCore);