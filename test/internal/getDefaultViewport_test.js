import { should } from 'chai';
import getDefaultViewport from '../../src/internal/getDefaultViewport';

should();

describe('getDefaultViewport', function () {
  it('should throw an error if we don\'t have a canvas', function () {
    getDefaultViewport.should.throw('getDefaultViewport: parameter canvas must not be undefined');
  });

  it('should return an empty viewport if no image is provided', function () {
    const emptyViewport = getDefaultViewport({});

    emptyViewport.should.have.all.keys(['scale', 'translation', 'voi', 'invert', 'pixelReplication', 'rotation', 'hflip', 'vflip', 'modalityLUT', 'voiLUT', 'colormap', 'labelmap', 'displayedArea']);
  });
});
