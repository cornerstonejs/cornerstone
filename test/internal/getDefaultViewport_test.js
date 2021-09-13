import { assert, should } from 'chai'; // eslint-disable-line import/extensions

import getDefaultViewport from '../../src/internal/getDefaultViewport.js';

should();

describe('getDefaultViewport', function () {
  it('should throw an error if we don\'t have a canvas', function () {
    getDefaultViewport.should.throw('getDefaultViewport: parameter canvas must not be undefined');
  });

  it('should return an empty viewport if no image is provided', function () {
    const emptyViewport = getDefaultViewport({});

    emptyViewport.should.have.all.keys(['scale', 'translation', 'voi', 'invert', 'pixelReplication', 'rotation', 'hflip', 'vflip', 'modalityLUT', 'voiLUT', 'colormap', 'labelmap', 'displayedArea']);
  });

  describe('when provided an image with all values available', function () {
    beforeEach(function () {
      this.canvas = document.createElement('canvas');

      this.canvas.width = 100;
      this.canvas.height = 100;

      this.imageViewport = {
        width: 100,
        height: 100,
        rowPixelSpacing: 1,
        columnPixelSpacing: 2,
        windowWidth: 255,
        windowCenter: 127,
        invert: true,
        modalityLUT: 'm-lut',
        voiLUT: 'voi-lut',
        colormap: 'color-map'
      };
    });

    it('should return a viewport with defined values and calculated scale value', function () {
      const viewport = getDefaultViewport(this.canvas, this.imageViewport);

      assert.equal(viewport.scale, 0.5); // should take the columnPixelSpacing into consideration and scale down by 1/2
      assert.equal(viewport.displayedArea.presentationSizeMode, 'NONE');
      assert.equal(viewport.displayedArea.rowPixelSpacing, this.imageViewport.rowPixelSpacing);
      assert.equal(viewport.displayedArea.columnPixelSpacing, this.imageViewport.columnPixelSpacing);
      assert.equal(viewport.voi.windowWidth, this.imageViewport.windowWidth);
      assert.equal(viewport.voi.windowCenter, this.imageViewport.windowCenter);
      assert.equal(viewport.invert, this.imageViewport.invert);
      assert.equal(viewport.modalityLUT, this.imageViewport.modalityLUT);
      assert.equal(viewport.voiLUT, this.imageViewport.voiLUT);
      assert.equal(viewport.colormap, this.imageViewport.colormap);
    });

  });

  describe('when provided image is missing the column/row pixel spacing', function () {
    beforeEach(function () {
      this.canvas = document.createElement('canvas');

      this.canvas.width = 100;
      this.canvas.height = 100;

      this.imageViewport = {
        width: 100,
        height: 100
      };
    });

    it('should be smart to set the default values to 1/1', function () {
      const viewport = getDefaultViewport(this.canvas, this.imageViewport);

      assert.equal(viewport.displayedArea.rowPixelSpacing, 1);
      assert.equal(viewport.displayedArea.columnPixelSpacing, 1);
      assert.equal(viewport.scale, 1);
    });
  });
});
