import { assert } from 'chai';

import storedPixelDataToCanvasImageData from '../../src/internal/storedPixelDataToCanvasImageData.js';

describe('storedPixelDataToCanvasImageData', function () {
  it('storedPixelDataToCanvasImageData minPixel = 0', function () {
        // Arrange
    const lut = [0, 255];
    const canvasImageDataData = [255, 255, 255, 128, 255, 255, 255, 128];
    const image = {
      minPixelValue: 0,
      maxPixelValue: 1,
      width: 1,
      height: 2,
      getPixelData () {
        return new Uint16Array([0, 1]);
      },
      stats: {}
    };

        // Act
    storedPixelDataToCanvasImageData(image, lut, canvasImageDataData);

        // Assert
    assert.equal(canvasImageDataData[0], 255, 'R1');
    assert.equal(canvasImageDataData[1], 255, 'G1');
    assert.equal(canvasImageDataData[2], 255, 'B1');
    assert.equal(canvasImageDataData[3], 0, 'A1');
    assert.equal(canvasImageDataData[4], 255, 'R2');
    assert.equal(canvasImageDataData[5], 255, 'G2');
    assert.equal(canvasImageDataData[6], 255, 'B2');
    assert.equal(canvasImageDataData[7], 255, 'A2');
  });

  it('storedPixelDataToCanvasImageData minPixel < 0', function () {
        // Arrange
    const lut = [0, 255];
    const canvasImageDataData = [255, 255, 255, 128, 255, 255, 255, 128];
    const image = {
      minPixelValue: -1,
      maxPixelValue: 0,
      width: 1,
      height: 2,
      getPixelData () {
        return new Int16Array([-1, 0]);
      },
      stats: {}
    };

        // Act
    storedPixelDataToCanvasImageData(image, lut, canvasImageDataData);

        // Assert
    assert.equal(canvasImageDataData[0], 255, 'R1');
    assert.equal(canvasImageDataData[1], 255, 'G1');
    assert.equal(canvasImageDataData[2], 255, 'B1');
    assert.equal(canvasImageDataData[3], 0, 'A1');
    assert.equal(canvasImageDataData[4], 255, 'R2');
    assert.equal(canvasImageDataData[5], 255, 'G2');
    assert.equal(canvasImageDataData[6], 255, 'B2');
    assert.equal(canvasImageDataData[7], 255, 'A2');
  });

  it('storedPixelDataToCanvasImageData minPixel > 0', function () {
        // Arrange
    const lut = [];

    lut[1] = 0;
    lut[2] = 255;
    const canvasImageDataData = [255, 255, 255, 128, 255, 255, 255, 128];
    const image = {
      minPixelValue: 1,
      maxPixelValue: 2,
      width: 1,
      height: 2,
      getPixelData () {
        return new Uint16Array([1, 2]);
      },
      stats: {}
    };

        // Act
    storedPixelDataToCanvasImageData(image, lut, canvasImageDataData);

        // Assert
    assert.equal(canvasImageDataData[0], 255, 'R1');
    assert.equal(canvasImageDataData[1], 255, 'G1');
    assert.equal(canvasImageDataData[2], 255, 'B1');
    assert.equal(canvasImageDataData[3], 0, 'A1');
    assert.equal(canvasImageDataData[4], 255, 'R2');
    assert.equal(canvasImageDataData[5], 255, 'G2');
    assert.equal(canvasImageDataData[6], 255, 'B2');
    assert.equal(canvasImageDataData[7], 255, 'A2');
  });
});
