// import { assert } from 'chai';

import generateLutNew from '../../src/internal/generateLutNew.js';

describe('generateLutNew', function () {
  beforeEach(function () {
    this.windowWidth = 255;
    this.windowCenter = 127;

    this.voiLUT = {
      firstValueMapped: 0,
      numBitsPerEntry: 8,
      lut: [0, 128, 255]
    };

  });

  it('min pixel < 0', function () {
    // Arrange
    const image = {
      minPixelValue: -2,
      maxPixelValue: 2,
      slope: 1.0,
      intercept: 0,
      windowCenter: 1,
      windowWidth: 2
    };

    const invert = false;

    // Act
    generateLutNew(image, this.windowWidth, this.windowCenter, invert, this.modalityLUT, this.voiLUT);

    // Assert
    // assert.equal(lut.length, 3, 'lut length is 3');
    // assert.equal(lut[0], 0, 'lut entry 0 is 0');
    // assert.equal(lut[1], 128, 'lut entry 1 is 128');
    // assert.equal(lut[2], 255, 'lut entry 2 is 255');
  });

  it('min pixel = 0', function () {
    // Arrange
    const image = {
      minPixelValue: 0,
      maxPixelValue: 2,
      slope: 1.0,
      intercept: 0,
      windowCenter: 1,
      windowWidth: 2
    };

    const invert = false;

    // Act
    generateLutNew(image, this.windowWidth, this.windowCenter, invert, this.modalityLUT, this.voiLUT);

    // Assert
    // assert.equal(lut.length, 3, 'lut length is 3');
    // assert.equal(lut[0], 0, 'lut entry 0 is 0');
    // assert.equal(lut[1], 128, 'lut entry 1 is 128');
    // assert.equal(lut[2], 255, 'lut entry 2 is 255');
  });

  it('should handle inverted images', function () {
    // Arrange
    const image = {
      minPixelValue: 0,
      maxPixelValue: 2,
      slope: 1.0,
      intercept: 0,
      windowCenter: 1,
      windowWidth: 2
    };

    const invert = true;

    // Act
    generateLutNew(image, this.windowWidth, this.windowCenter, invert, this.modalityLUT, this.voiLUT);

    // Assert
    // assert.equal(lut.length, 3, 'lut length is 3');
    // assert.equal(lut[0], 255, 'lut entry 0 is 255');
    // assert.equal(lut[1], 127, 'lut entry 1 is 127');
    // assert.equal(lut[2], 0, 'lut entry 2 is 0');
  });
});
