
(function(csc) {
    QUnit.module("cornerstoneCore.storedPixelDataToCanvasImageData");

    QUnit.test("storedPixelDataToCanvasImageData minPixel = 0", function(assert) {
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
        assert.equal(canvasImageDataData[0], 255, "R1");
        assert.equal(canvasImageDataData[1], 255, "G1");
        assert.equal(canvasImageDataData[2], 255, "B1");
        assert.equal(canvasImageDataData[3], 0, "A1");
        assert.equal(canvasImageDataData[4], 255, "R2");
        assert.equal(canvasImageDataData[5], 255, "G2");
        assert.equal(canvasImageDataData[6], 255, "B2");
        assert.equal(canvasImageDataData[7], 255, "A2");
    });

    QUnit.test("storedPixelDataToCanvasImageData minPixel < 0", function(assert) {
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
        assert.equal(canvasImageDataData[0], 255, "R1");
        assert.equal(canvasImageDataData[1], 255, "G1");
        assert.equal(canvasImageDataData[2], 255, "B1");
        assert.equal(canvasImageDataData[3], 0, "A1");
        assert.equal(canvasImageDataData[4], 255, "R2");
        assert.equal(canvasImageDataData[5], 255, "G2");
        assert.equal(canvasImageDataData[6], 255, "B2");
        assert.equal(canvasImageDataData[7], 255, "A2");
    });

    QUnit.test("storedPixelDataToCanvasImageData minPixel > 0", function(assert) {
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
        assert.equal(canvasImageDataData[0], 255, "R1");
        assert.equal(canvasImageDataData[1], 255, "G1");
        assert.equal(canvasImageDataData[2], 255, "B1");
        assert.equal(canvasImageDataData[3], 0, "A1");
        assert.equal(canvasImageDataData[4], 255, "R2");
        assert.equal(canvasImageDataData[5], 255, "G2");
        assert.equal(canvasImageDataData[6], 255, "B2");
        assert.equal(canvasImageDataData[7], 255, "A2");
    });

})(cornerstone);
