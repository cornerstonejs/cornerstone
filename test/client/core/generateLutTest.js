
(function(csc) {
    module("cornerstoneCore.generateLut");

    test("3 entry lut", function() {
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
        var lut = csc.generateLut(image);

        // Assert
        equal(lut.length, 2, "lut length is 2");
        equal(lut[-1], 0, "lut entry -1 is 0");
        equal(lut[0], 128, "lut entry 0 is 128");
        equal(lut[1], 255, "lut entry 1 is 255");
    });

    test("slope", function() {
        // Arrange
        var image = {
            minPixelValue : -1,
            maxPixelValue : 1,
            slope: 2.0,
            intercept: 0,
            windowCenter : 0,
            windowWidth : 4
        };

        // Act
        var lut = csc.generateLut(image);

        // Assert
        equal(lut.length, 2, "lut length is 2");
        equal(lut[-1], 0, "lut entry -1 is 0");
        equal(lut[0], 128, "lut entry 0 is 128");
        equal(lut[1], 255, "lut entry 1 is 255");
    });

    test("intercept", function() {
        // Arrange
        var image = {
            minPixelValue : -1,
            maxPixelValue : 1,
            slope: 1.0,
            intercept: -1,
            windowCenter : 0,
            windowWidth : 2
        };

        // Act
        var lut = csc.generateLut(image);

        // Assert
        equal(lut.length, 2, "lut length is 2");
        equal(lut[-1], 0, "lut entry -1 is 0");
        equal(lut[0], 0, "lut entry 0 is 0");
        equal(lut[1], 128, "lut entry 1 is 128");
    });


})(cornerstoneCore);