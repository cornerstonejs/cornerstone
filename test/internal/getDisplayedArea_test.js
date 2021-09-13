import { expect, should } from 'chai'; // eslint-disable-line import/extensions
import getDisplayedArea from '../../src/internal/getDisplayedArea.js';

should();

describe('getDisplayedArea', function () {
  it('should throw an error if we don\'t have an image', function () {
    getDisplayedArea.should.throw('getDisplayedArea: parameter image must not be undefined');
  });

  it('should return the viewport displayedArea if one is provided', function () {
    const testViewport = { displayedArea: 'displayed-area' };
    const displayedArea = getDisplayedArea({}, testViewport);

    expect(displayedArea).to.deep.equal(testViewport.displayedArea);
  });

  describe('when provided an image', function () {
    beforeEach(function () {
      this.canvas = document.createElement('canvas');

      this.canvas.width = 100;
      this.canvas.height = 100;

      this.imageViewport = {
        width: 100,
        height: 200,
        columns: 100,
        rows: 200,
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

    it('should return a displayedArea with values calculated from the image if no viewport provided', function () {
      const displayedArea = getDisplayedArea(this.imageViewport);

      expect(displayedArea.tlhc.x).to.deep.equal(1);
      expect(displayedArea.tlhc.y).to.deep.equal(1);
      expect(displayedArea.brhc.x).to.deep.equal(this.imageViewport.columns);
      expect(displayedArea.brhc.y).to.deep.equal(this.imageViewport.rows);
      expect(displayedArea.rowPixelSpacing).to.deep.equal(this.imageViewport.rowPixelSpacing);
      expect(displayedArea.columnPixelSpacing).to.deep.equal(this.imageViewport.columnPixelSpacing);
      expect(displayedArea.presentationSizeMode).to.deep.equal('NONE');
    });

    it('should return a displayedArea from viewport if one is provided', function () {
      const viewport = { displayedArea: {
        tlhc: {
          x: 10,
          y: 20
        },
        brhc: {
          x: 512,
          y: 400
        },
        rowPixelSpacing: 0.5,
        columnPixelSpacing: 1,
        presentationSizeMode: 'MAGNIFY'
      } };

      const displayedArea = getDisplayedArea(this.imageViewport, viewport);

      expect(displayedArea).to.deep.equal(viewport.displayedArea);
    });

  });
});
