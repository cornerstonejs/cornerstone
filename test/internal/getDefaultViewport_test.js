import { assert } from 'chai';

import getDefaultViewport from '../../src/internal/getDefaultViewport';

describe('getDefaultViewport', function () {
  it('should throw an error if we don\'t have a canvas', function () {
    assert.throws(getDefaultViewport, 'getDefaultViewport: parameter canvas must not be undefined');
  });

  it('should return an empty viewport if no image is provided', function () {
    const emptyViewport = getDefaultViewport({});

    assert.containsAllKeys(emptyViewport, ['scale', 'translation', 'voi', 'invert', 'pixelReplication', 'rotation', 'hflip', 'vflip', 'modalityLUT', 'voiLUT', 'colormap', 'labelmap']);
  });
});
