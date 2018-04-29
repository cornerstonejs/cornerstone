import { should } from 'chai'; // eslint-disable-line import/extensions
import storedColorPixelDataToCanvasImageData from '../../src/internal/storedColorPixelDataToCanvasImageData.js';

should();

describe('storedColorPixelDataToCanvasImageData', function () {
  before(function () {
    this.image = {
      getPixelData () {
        return [1, 2, 3, 4, 2, 0, 1, 0];
      },
      stats: {}
    };
    this.lut = [1, 2, 3, 4, 5, 6, 7, 8];
  });

  describe('pixel value less than 0', function () {
    before(function () {
      this.image.minPixelValue = -3;
    });

    it('should generate the image subtracting the minimum pixel value', function () {
      const canvasImageDataData = [0, 0, 0, 0, 0, 0, 0, 0];

      storedColorPixelDataToCanvasImageData(this.image, this.lut, canvasImageDataData);

      canvasImageDataData.should.be.deep.equal([5, 6, 7, 0, 6, 4, 5, 0]);
    });
  });

  describe('pixel value is equal to or greater than 0', function () {
    before(function () {
      this.image.minPixelValue = 0;
    });

    it('should generate the image just using the lookup table', function () {
      const canvasImageDataData = [0, 0, 0, 0, 0, 0, 0, 0];

      storedColorPixelDataToCanvasImageData(this.image, this.lut, canvasImageDataData);

      canvasImageDataData.should.be.deep.equal([2, 3, 4, 0, 3, 1, 2, 0]);
    });
  });
});
