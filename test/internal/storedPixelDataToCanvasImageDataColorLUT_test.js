import { should } from 'chai'; // eslint-disable-line import/extensions
import storedPixelDataToCanvasImageDataColorLUT from '../../src/internal/storedPixelDataToCanvasImageDataColorLUT.js';

should();

describe('storedPixelDataToCanvasImageDataColorLUT', function () {
  before(function () {
    this.colorLut = [[3, 2, 1, 1], [7, 6, 5, 4], [6, 1, 2, 8]];
    this.image = {
      stats: {}
    };
  });

  beforeEach(function () {
    this.canvasImageData = [255, 255, 255, 128, 255, 255, 255, 128];
  });

  it('should get LUT values equal to its pixels when minPixelValue == 0', function () {
    this.image.minPixelValue = 0;
    this.image.getPixelData = function () {
      return [0, 1];
    };

    storedPixelDataToCanvasImageDataColorLUT(this.image, this.colorLut, this.canvasImageData);

    this.canvasImageData.should.be.deep.equal([3, 2, 1, 1, 7, 6, 5, 4]);
  });

  it('should get LUT values equal to its pixels minus its minimun pixel value when minPixelValue < 0', function () {
    this.image.minPixelValue = -1;
    this.image.getPixelData = function () {
      return [-1, 1];
    };

    storedPixelDataToCanvasImageDataColorLUT(this.image, this.colorLut, this.canvasImageData);

    this.canvasImageData.should.be.deep.equal([3, 2, 1, 1, 6, 1, 2, 8]);
  });
});
