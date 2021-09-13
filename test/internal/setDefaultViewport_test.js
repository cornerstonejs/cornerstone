import { expect, should } from 'chai'; // eslint-disable-line import/extensions
import setDefaultViewport, { state } from '../../src/internal/setDefaultViewport.js';

should();

describe('setDefaultViewport', function () {
  beforeEach(function () {
    state.viewport = {};
  });

  it('should default to an empty object if no value is provided', function () {
    setDefaultViewport();

    const currentDefaultViewport = state.viewport;
    const expectedDefaultViewport = {};

    expect(currentDefaultViewport).to.deep.equal(expectedDefaultViewport);
  });

  it('should equal the value of the provided object', function () {
    const exampleViewportDefaults = {
      pixelReplication: true,
      someOtherProperty: 'hello'
    };

    setDefaultViewport(exampleViewportDefaults);

    const currentDefaultViewport = state.viewport;
    const expectedDefaultViewport = exampleViewportDefaults;

    expect(currentDefaultViewport).to.deep.equal(expectedDefaultViewport);
  });
});
