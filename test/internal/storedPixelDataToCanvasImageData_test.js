import { assert } from 'chai';

import storedPixelDataToCanvasImageData from '../../src/internal/storedPixelDataToCanvasImageData.js';

describe('storedPixelDataToCanvasImageData', function () {
  before(function () {
    this.lut = [0, 255];
    // Arrange
    this.image = {
      maxPixelValue: 1,
      width: 1,
      height: 2,
      stats: {}
    };
  });

  beforeEach(function () {
    this.canvasImageDataData = [255, 255, 255, 128, 255, 255, 255, 128];
  });

  describe('Uint16Array', function () {
    before(function () {
      this.image.getPixelData = function () {
        return new Uint16Array([0, 1]);
      };
    });

    it('storedPixelDataToCanvasImageData minPixel = 0', function () {
      this.image.minPixelValue = 0;

      // Act
      storedPixelDataToCanvasImageData(this.image, this.lut, this.canvasImageDataData);
  
      // Assert
      assert.equal(this.canvasImageDataData[0], 255, 'R1');
      assert.equal(this.canvasImageDataData[1], 255, 'G1');
      assert.equal(this.canvasImageDataData[2], 255, 'B1');
      assert.equal(this.canvasImageDataData[3], 0, 'A1');
      assert.equal(this.canvasImageDataData[4], 255, 'R2');
      assert.equal(this.canvasImageDataData[5], 255, 'G2');
      assert.equal(this.canvasImageDataData[6], 255, 'B2');
      assert.equal(this.canvasImageDataData[7], 255, 'A2');
    });

    it('storedPixelDataToCanvasImageData minPixel > 0', function () {
      this.image.minPixelValue = 1;
      this.image.getPixelData = function () {
        return new Uint16Array([1, 1]);
      };

      // Act
      storedPixelDataToCanvasImageData(this.image, this.lut, this.canvasImageDataData);

      // Assert
      assert.equal(this.canvasImageDataData[0], 255, 'R1');
      assert.equal(this.canvasImageDataData[1], 255, 'G1');
      assert.equal(this.canvasImageDataData[2], 255, 'B1');
      assert.equal(this.canvasImageDataData[3], 255, 'A1');
      assert.equal(this.canvasImageDataData[4], 255, 'R2');
      assert.equal(this.canvasImageDataData[5], 255, 'G2');
      assert.equal(this.canvasImageDataData[6], 255, 'B2');
      assert.equal(this.canvasImageDataData[7], 255, 'A2');
    });
  });

  describe('int16Array', function () {
    before(function () {
      // Arrange
      this.lut = [0, 255];
      this.image = {
        minPixelValue: -1,
        maxPixelValue: 0,
        width: 1,
        height: 2,
        getPixelData () {
          return new Int16Array([-1, 0]);
        },
        stats: {}
      };
    });

    beforeEach(function () {
      this.canvasImageDataData = [255, 255, 255, 128, 255, 255, 255, 128];
    });

    it('storedPixelDataToCanvasImageData minPixel < 0', function () {
      // Act
      storedPixelDataToCanvasImageData(this.image, this.lut, this.canvasImageDataData);

      // Assert
      assert.equal(this.canvasImageDataData[0], 255, 'R1');
      assert.equal(this.canvasImageDataData[1], 255, 'G1');
      assert.equal(this.canvasImageDataData[2], 255, 'B1');
      assert.equal(this.canvasImageDataData[3], 0, 'A1');
      assert.equal(this.canvasImageDataData[4], 255, 'R2');
      assert.equal(this.canvasImageDataData[5], 255, 'G2');
      assert.equal(this.canvasImageDataData[6], 255, 'B2');
      assert.equal(this.canvasImageDataData[7], 255, 'A2');
    });

    it('storedPixelDataToCanvasImageData minPixel > 0', function () {
      this.image.minPixelValue = 1;
      this.image.getPixelData = function () {
        return new Int16Array([1, 0]);
      };

      // Act
      storedPixelDataToCanvasImageData(this.image, this.lut, this.canvasImageDataData);

      // Assert
      assert.equal(this.canvasImageDataData[0], 255, 'R1');
      assert.equal(this.canvasImageDataData[1], 255, 'G1');
      assert.equal(this.canvasImageDataData[2], 255, 'B1');
      assert.equal(this.canvasImageDataData[3], 255, 'A1');
      assert.equal(this.canvasImageDataData[4], 255, 'R2');
      assert.equal(this.canvasImageDataData[5], 255, 'G2');
      assert.equal(this.canvasImageDataData[6], 255, 'B2');
      assert.equal(this.canvasImageDataData[7], 0, 'A2');
    });
  });

  describe('regular Array', function () {
    it('aha', function () {
      this.image.minPixelValue = -1;
      this.image.maxPixelValue = 0;
      this.image.getPixelData = function () {
        return [-1, 0];
      };

      storedPixelDataToCanvasImageData(this.image, this.lut, this.canvasImageDataData);

      // Assert
      assert.equal(this.canvasImageDataData[0], 255, 'R1');
      assert.equal(this.canvasImageDataData[1], 255, 'G1');
      assert.equal(this.canvasImageDataData[2], 255, 'B1');
      assert.equal(this.canvasImageDataData[3], 0, 'A1');
      assert.equal(this.canvasImageDataData[4], 255, 'R2');
      assert.equal(this.canvasImageDataData[5], 255, 'G2');
      assert.equal(this.canvasImageDataData[6], 255, 'B2');
      assert.equal(this.canvasImageDataData[7], 255, 'A2');
    });
  });
});
