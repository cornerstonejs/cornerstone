
(function(csc) {
    QUnit.module("cornerstoneCore.generateLut");


     QUnit.test("min pixel < 0", function(assert) {
        // Arrange
        var image = {
            minPixelValue : -1,
            maxPixelValue : 1,
            slope: 1.0,
            intercept: 0,
            windowCenter : 0,
            windowWidth : 2
        };

        // Act
        csc.generateLut(image, 2, 0, false);

        // Assert
        assert.equal(image.lut.length, 3, "lut length is 3");
        assert.equal(image.lut[0], 0, "lut entry -1 is 0");
        assert.equal(image.lut[1], 128, "lut entry 0 is 128");
        assert.equal(image.lut[2], 255, "lut entry 1 is 255");
    });

    QUnit.test("min pixel = 0", function(assert) {
        // Arrange
        var image = {
            minPixelValue : 0,
            maxPixelValue : 2,
            slope: 1.0,
            intercept: 0,
            windowCenter : 1,
            windowWidth : 2
        };

        // Act
        csc.generateLut(image, 2, 1, false);

        // Assert
        assert.equal(image.lut.length, 3, "lut length is 3");
        assert.equal(image.lut[0], 0, "lut entry 0 is 0");
        assert.equal(image.lut[1], 128, "lut entry 1 is 128");
        assert.equal(image.lut[2], 255, "lut entry 2 is 255");
    });

    QUnit.test("min pixel > 0", function(assert) {
        // Arrange
        var image = {
            minPixelValue : 1,
            maxPixelValue : 3,
            slope: 1.0,
            intercept: 0,
            windowCenter : 2,
            windowWidth : 2
        };

        // Act
        csc.generateLut(image, 2, 2, false);

        // Assert
        assert.equal(image.lut.length, 4, "lut length is 4");
        assert.equal(image.lut[0], 0, "lut entry 0 is 0");
        assert.equal(image.lut[1], 0, "lut entry 1 is 0");
        assert.equal(image.lut[2], 128, "lut entry 2 is 128");
        assert.equal(image.lut[3], 255, "lut entry 3 is 255");
    });

    QUnit.test("slope and intercept", function(assert) {
        // Arrange
        var image = {
            minPixelValue : 0,
            maxPixelValue : 2,
            slope: 2.0,
            intercept: 1,
            windowCenter : 3,
            windowWidth : 4
        };

        // Act
        csc.generateLut(image, 4, 3, false);

        // Assert
        assert.equal(image.lut.length, 3, "lut length is 3");
        assert.equal(image.lut[0], 0, "lut entry 0 is 0");
        assert.equal(image.lut[1], 128, "lut entry 1 is 128");
        assert.equal(image.lut[2], 255, "lut entry 2 is 255");
    });


})(cornerstone);
