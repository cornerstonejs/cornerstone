import { assert } from 'chai';

import enable from '../src/enable.js';
import displayImage from '../src/displayImage.js';
import getImage from '../src/getImage.js';
import disable from '../src/disable.js';

describe('getImage', function () {
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

  it('should retrieve the displayed image', function () {
    const image = getImage(this.element);

    assert.deepEqual(this.image, image);
  });

  afterEach(function () {
    disable(this.element);
  });
});
