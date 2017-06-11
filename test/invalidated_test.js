import { assert } from 'chai';

import enable from '../src/enable.js';
import displayImage from '../src/displayImage.js';
import invalidate from '../src/invalidate.js';
import disable from '../src/disable.js';
import { getEnabledElement } from '../src/enabledElements.js';

describe('invalidate', function () {
  beforeEach(function () {
    // Arrange
    this.element = document.createElement('div');
    const options = {};

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

    enable(this.element, options);
    displayImage(this.element, this.image);
  });

  it('should invalidate the image and trigger CornerstoneInvalidated', function (done) {
    const element = this.element;
    const enabledElement = getEnabledElement(this.element);

    $(element).on('CornerstoneInvalidated', function (event, eventData) {
      // Assert
      assert.equal(eventData.element, element);
      done();
    });

    invalidate(this.element);
    assert.equal(enabledElement.invalid, true);
    assert.equal(enabledElement.needsRedraw, true);
  });

  afterEach(function () {
    disable(this.element);
  });
});
