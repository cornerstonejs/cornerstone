import { assert } from 'chai';

import enable from '../src/enable.js';
import displayImage from '../src/displayImage.js';
import fitToWindow from '../src/fitToWindow.js';
import setViewport from '../src/setViewport.js';
import getViewport from '../src/getViewport.js';
import disable from '../src/disable.js';

describe('fitToWindow', function () {
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

  it('should fit the image to the element so that all pixels are visible', function () {
    // Arrange
    displayImage(this.element, this.image);

    // Act
    // const originalViewport = getViewport(this.element);

    fitToWindow(this.element);

    // Assert
    const viewport = getViewport(this.element);

    assert.equal(viewport.translation.x, 0);
    assert.equal(viewport.translation.y, 0);

    // TODO: Check this later. I'm not sure how else to check that scale is reset correctly
    // assert.notEqual(originalViewport.scale, viewport.scale);
  });

  it('should fit the image properly if the image is rotated', function () {
    // Arrange
    displayImage(this.element, this.image);

    // Act
    const originalViewport = getViewport(this.element);

    originalViewport.rotation = 90;
    setViewport(this.element, originalViewport);
    fitToWindow(this.element);

    // Assert
    const viewport = getViewport(this.element);

    assert.equal(viewport.translation.x, 0);
    assert.equal(viewport.translation.y, 0);

    // TODO: Check this later. I'm not sure how else to check that scale is reset correctly
    // assert.notEqual(originalViewport.scale, viewport.scale);
  });

  afterEach(function () {
    disable(this.element);
  });
});
