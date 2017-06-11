import { assert } from 'chai';

import enable from '../src/enable.js';
import displayImage from '../src/displayImage.js';
import getStoredPixels from '../src/getStoredPixels.js';
import disable from '../src/disable.js';

describe('getStoredPixels', function () {
  beforeEach(function () {
    // Arrange
    this.element = document.createElement('div');
    const height = 3;
    const width = 3;

    const getPixelData = () => new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    // 1   2   3
    // 4   5   6
    // 7   8   9

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
    displayImage(this.element, this.image);
  });

  it('should retrieve the stored pixel values in a rectangular region', function () {
    // Arrange
    const element = this.element;

    // Act
    const storedPixels1 = getStoredPixels(element, 1, 1, 2, 2);
    const storedPixels2 = getStoredPixels(element, 0, 0, 1, 1);
    const storedPixels3 = getStoredPixels(element, 0, 1, 2, 2);

    // Assert
    assert.deepEqual(storedPixels1, [5, 6, 8, 9]);
    assert.deepEqual(storedPixels2, [1]);
    assert.deepEqual(storedPixels3, [4, 5, 7, 8]);
  });

  it('should throw an error if the element is undefined', function () {
    assert.throws(() => getStoredPixels(undefined, 0, 0, 1, 1));
  });

  afterEach(function () {
    disable(this.element);
  });
});
