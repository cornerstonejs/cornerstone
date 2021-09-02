import { should } from 'chai'; // eslint-disable-line import/extensions
import storedPixelDataToCanvasImageDataPseudocolorLUT from '../../src/internal/storedPixelDataToCanvasImageDataPseudocolorLUT.js';

should();

describe('storedPixelDataToCanvasImageDataPseudocolorLUT', function () {
  before(function () {
    this.grayscaleLut = [1, 2];
    this.colorLut = [[1, 2, 3, 4], [4, 4, 1, 2], [7, 7, 2, 0]];
    this.image = {
      minPixelValue: 0,
      stats: {},
      getPixelData () {
        return [0, 1];
      }
    };
  });

  beforeEach(function () {
    this.canvasImageData = [255, 255, 255, 128, 255, 255, 255, 128];
  });

  it('should get the values from colorLUT without the minPixel offset when minPixelValue == 0', function () {
    storedPixelDataToCanvasImageDataPseudocolorLUT(this.image, this.grayscaleLut, this.colorLut, this.canvasImageData);

    this.canvasImageData.should.be.deep.equal([4, 4, 1, 2, 7, 7, 2, 0]);
  });

  it('should get the values from colorLUT with the minPixel offset when minPixelValue < 0', function () {
    this.image.minPixelValue = -1;
    this.image.getPixelData = function () {
      return [-1, 0];
    };

    storedPixelDataToCanvasImageDataPseudocolorLUT(this.image, this.grayscaleLut, this.colorLut, this.canvasImageData);

    this.canvasImageData.should.be.deep.equal([4, 4, 1, 2, 7, 7, 2, 0]);
  });

  describe('Color 4 Byte image', function () {
    before(function () {
      this.image.color = true;
      this.grayscaleLut = [0, 1, 2, 3, 4, 5, 6, 7];
      this.colorLut = [[1, 2, 3, 4], [4, 4, 1, 2], [7, 7, 2, 0], [10, 10, 5, 6], [1, 2, 6, 5], [11, 11, 8, 9], [1, 2, 9, 8], [14, 14, 12, 13]];
      this.image.getPixelData = function () {
        return [0, 1, 2, 3, 4, 5, 6, 7];
      };
      this.image.width = 2;
      this.image.height = 1;
    });

    it('should get the values from colorLUT for color 4 byte image without the minPixel offset when minPixelValue == 0', function () {
      this.image.minPixelValue = 0;

      storedPixelDataToCanvasImageDataPseudocolorLUT(this.image, this.grayscaleLut, this.colorLut, this.canvasImageData);

      this.canvasImageData.should.be.deep.equal([4, 4, 1, 2, 11, 11, 8, 9]);
    });

    it('should get the values from colorLUT for color 4 byte image with the minPixel offset when minPixelValue < 0', function () {
      this.image.minPixelValue = -1;

      storedPixelDataToCanvasImageDataPseudocolorLUT(this.image, this.grayscaleLut, this.colorLut, this.canvasImageData);

      this.canvasImageData.should.be.deep.equal([7, 7, 2, 0, 1, 2, 9, 8]);
    });
  });
});
