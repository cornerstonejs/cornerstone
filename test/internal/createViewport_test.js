import { expect, should } from 'chai'; // eslint-disable-line import/extensions

import createViewport from '../../src/internal/createViewport.js';
import { state } from '../../src/internal/setDefaultViewport.js';

should();

describe('createViewport', function () {
  let defaultViewport;

  beforeEach(function () {
    defaultViewport = {
      scale: 1,
      translation: {
        x: 0,
        y: 0
      },
      voi: {
        windowWidth: undefined,
        windowCenter: undefined
      },
      invert: false,
      pixelReplication: false,
      rotation: 0,
      hflip: false,
      vflip: false,
      modalityLUT: undefined,
      voiLUT: undefined,
      colormap: undefined,
      labelmap: false,
      displayedArea: undefined
    };
  });

  it('should return the expected object', function () {
    const createdViewport = createViewport();

    expect(createdViewport).to.deep.equal(defaultViewport);
  });

  it('should override the default return value with set defaults', function () {
    // First Run - Expected
    const expectedViewport = createViewport();

    // Setup
    const exampleViewportDefaults = {
      pixelReplication: true,
      someOtherProperty: 'hello'
    };

    state.viewport = exampleViewportDefaults;
    expectedViewport.pixelReplication = true;
    expectedViewport.someOtherProperty = 'hello';

    // SUT
    const createdViewport = createViewport();

    // ASSERT
    expect(createdViewport).to.deep.equal(expectedViewport);

    // Undo setup patch
    state.viewport = {};
  });
});
