import { should, assert } from 'chai'; // eslint-disable-line import/extensions
import getImageFitScale from '../../src/internal/getImageFitScale.js';

should();

describe('getImageScale', function () {
  it('should throw an error if we don\'t have a canvas', function () {
    getImageFitScale.should.throw('getImageScale: parameter windowSize must not be undefined');
  });

  describe('when provided an image that is larger than the canvas and magnified', function () {
    beforeEach(function () {
      this.canvas = document.createElement('canvas');

      this.canvas.width = 100;
      this.canvas.height = 100;

      this.imageViewport = {
        width: 200,
        height: 200,
        columnPixelSpacing: 2,
        rowPixelSpacing: 1
      };
    });

    it('should return a viewport with a scale factor to make the image smaller.', function () {
      const viewport = getImageFitScale(this.canvas, this.imageViewport, 90);

      assert.equal(viewport.verticalScale, 0.5);
      assert.equal(viewport.horizontalScale, 0.25);
      assert.equal(viewport.scaleFactor, 0.25);
    });

  });
});
