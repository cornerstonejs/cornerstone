import { assert } from 'chai';

import enable from '../src/enable.js';
import displayImage from '../src/displayImage.js';
import invalidateImageId from '../src/invalidateImageId.js';
import disable from '../src/disable.js';
import { getEnabledElement } from '../src/enabledElements.js';

describe('invalidateImageId', function () {
  beforeEach(function () {
    // Arrange
    this.element1 = document.createElement('div');
    this.element2 = document.createElement('div');
    this.element3 = document.createElement('div');

    const options = {};

    const height = 2;
    const width = 2;

    const getPixelData = () => new Uint8Array([0, 255, 255, 0]);

    this.image1 = {
      imageId: 'exampleImageId1',
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

    this.image2 = {
      imageId: 'exampleImageId2',
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

    enable(this.element1, options);
    displayImage(this.element1, this.image1);

    enable(this.element2, options);
    displayImage(this.element2, this.image1);

    enable(this.element3, options);
    displayImage(this.element3, this.image2);
  });

  it('should invalidate all elements which are showing this image', function () {
    const enabledElement1 = getEnabledElement(this.element1);
    const enabledElement2 = getEnabledElement(this.element2);
    const enabledElement3 = getEnabledElement(this.element3);

    invalidateImageId(this.image1.imageId);

    assert.equal(enabledElement1.invalid, true);
    assert.equal(enabledElement1.needsRedraw, true);

    assert.equal(enabledElement2.invalid, true);
    assert.equal(enabledElement2.needsRedraw, true);

    assert.equal(enabledElement3.invalid, false);
    // assert.equal(enabledElement3.needsRedraw, false);
  });

  afterEach(function () {
    disable(this.element1);
    disable(this.element2);
    disable(this.element3);
  });
});
