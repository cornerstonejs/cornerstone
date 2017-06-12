import { assert } from 'chai';

import generateLut from '../../src/internal/generateLut.js';

describe('generateLut', function () {
  it('min pixel < 0', function () {
        // Arrange
    const image = {
      minPixelValue: -1,
      maxPixelValue: 1,
      slope: 1.0,
      intercept: 0,
      windowCenter: 0,
      windowWidth: 2
    };

        // Act
    const lut = generateLut(image, 2, 0, false);

        // Assert
    assert.equal(lut.length, 3, 'lut length is 3');
    assert.equal(lut[0], 0, 'lut entry -1 is 0');
    assert.equal(lut[1], 128, 'lut entry 0 is 128');
    assert.equal(lut[2], 255, 'lut entry 1 is 255');
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

        // Act
    const lut = generateLut(image, 2, 1, false);

        // Assert
    assert.equal(lut.length, 3, 'lut length is 3');
    assert.equal(lut[0], 0, 'lut entry 0 is 0');
    assert.equal(lut[1], 128, 'lut entry 1 is 128');
    assert.equal(lut[2], 255, 'lut entry 2 is 255');
  });

  it('min pixel > 0', function () {
        // Arrange
    const image = {
      minPixelValue: 1,
      maxPixelValue: 3,
      slope: 1.0,
      intercept: 0,
      windowCenter: 2,
      windowWidth: 2
    };

        // Act
    const lut = generateLut(image, 2, 2, false);

        // Assert
    assert.equal(lut.length, 4, 'lut length is 4');
    assert.equal(lut[0], 0, 'lut entry 0 is 0');
    assert.equal(lut[1], 0, 'lut entry 1 is 0');
    assert.equal(lut[2], 128, 'lut entry 2 is 128');
    assert.equal(lut[3], 255, 'lut entry 3 is 255');
  });

  it('slope and intercept', function () {
        // Arrange
    const image = {
      minPixelValue: 0,
      maxPixelValue: 2,
      slope: 2.0,
      intercept: 1,
      windowCenter: 3,
      windowWidth: 4
    };

        // Act
    const lut = generateLut(image, 4, 3, false);

        // Assert
    assert.equal(lut.length, 3, 'lut length is 3');
    assert.equal(lut[0], 0, 'lut entry 0 is 0');
    assert.equal(lut[1], 128, 'lut entry 1 is 128');
    assert.equal(lut[2], 255, 'lut entry 2 is 255');
  });

  it('should handle inverted images correctly', function () {
        // Arrange
    const image = {
      minPixelValue: 0,
      maxPixelValue: 2,
      slope: 2.0,
      intercept: 1,
      windowCenter: 3,
      windowWidth: 4
    };

        // Act
    const lut = generateLut(image, 4, 3, true);

        // Assert
    assert.equal(lut.length, 3, 'lut length is 3');
    assert.equal(lut[0], 255, 'lut entry 0 is 255');
    assert.equal(lut[1], 128, 'lut entry 1 is 128');
    assert.equal(lut[2], 0, 'lut entry 2 is 0');
  });
});
