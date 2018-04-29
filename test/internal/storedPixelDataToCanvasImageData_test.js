import { should } from 'chai'; // eslint-disable-line import/extensions
import storedPixelDataToCanvasImageData from '../../src/internal/storedPixelDataToCanvasImageData.js';

should();

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

      this.canvasImageDataData.should.be.deep.equal([255, 255, 255, 0, 255, 255, 255, 255]);
    });

    it('storedPixelDataToCanvasImageData minPixel > 0', function () {
      this.image.minPixelValue = 1;
      this.image.getPixelData = function () {
        return new Uint16Array([1, 1]);
      };

      // Act
      storedPixelDataToCanvasImageData(this.image, this.lut, this.canvasImageDataData);

      this.canvasImageDataData.should.be.deep.equal([255, 255, 255, 255, 255, 255, 255, 255]);
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

      this.canvasImageDataData.should.be.deep.equal([255, 255, 255, 0, 255, 255, 255, 255]);
    });

    it('storedPixelDataToCanvasImageData minPixel > 0', function () {
      this.image.minPixelValue = 1;
      this.image.getPixelData = function () {
        return new Int16Array([1, 0]);
      };

      // Act
      storedPixelDataToCanvasImageData(this.image, this.lut, this.canvasImageDataData);

      this.canvasImageDataData.should.be.deep.equal([255, 255, 255, 255, 255, 255, 255, 0]);
    });
  });

  describe('regular Array', function () {
    it('storedPixelDataToCanvasImageData minPixel < 0', function () {
      this.image.minPixelValue = -1;
      this.image.maxPixelValue = 0;
      this.image.getPixelData = function () {
        return [-1, 0];
      };

      storedPixelDataToCanvasImageData(this.image, this.lut, this.canvasImageDataData);

      this.canvasImageDataData.should.be.deep.equal([255, 255, 255, 0, 255, 255, 255, 255]);
    });
  });
});
