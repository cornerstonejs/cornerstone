import { assert } from 'chai';

import enable from '../src/enable.js';
import displayImage from '../src/displayImage.js';
import reset from '../src/reset.js';
import getDefaultViewport from '../src/internal/getDefaultViewport.js';
import getViewport from '../src/getViewport.js';
import disable from '../src/disable.js';
import { getEnabledElement } from '../src/enabledElements.js';

describe('reset', function () {
  beforeEach(function () {
    // Arrange
    this.element = document.createElement('div');
    const height = 2;
    const width = 2;

    const getPixelData = () => new Uint8Array([0, 255, 255, 0]);

    this.image = {
      imageId: 'exampleImageId',
      minPixelValue: 0,
      maxPixelValue: 255,
      slope: 1.0,
      intercept: 0,
      windowCenter: 127,
      windowWidth: 256,
      getPixelData,
      rows: height,
      columns: width,
      height,
      width,
      color: false,
      sizeInBytes: width * height * 2
    };

    enable(this.element);
  });

  it('should reset the element to the default viewport', function () {
    // Arrange
    displayImage(this.element, this.image);
    const enabledElement = getEnabledElement(this.element);

    // TODO: Should we be hardcoding the default viewport?
    const defaultViewport = getDefaultViewport(enabledElement.canvas, this.image);

    // Act
    reset(this.element);

    // Assert
    const viewport = getViewport(this.element);

    assert.deepEqual(defaultViewport, viewport);
  });

  afterEach(function () {
    disable(this.element);
  });
});
