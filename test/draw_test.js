import { assert } from 'chai'; // eslint-disable-line import/extensions

import enable from '../src/enable.js';
import displayImage from '../src/displayImage.js';
import draw from '../src/draw.js';
import disable from '../src/disable.js';

describe('draw', function () {
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

  it('should draw immediately', function (done) {
    // Arrange
    const element = this.element;
    const image = this.image;

    displayImage(this.element, this.image);

    element.addEventListener('cornerstoneimagerendered', function (event) {
      // Assert
      assert.equal(event.target, element);
      assert.equal(event.detail.image, image);
      done();
    });

    // Act
    draw(this.element);
  });

  it('should draw 300x150 images too (issue #300)', function (done) {
    // Arrange
    const element = this.element;
    const image = this.image;

    image.width = 300;
    image.height = 150;
    image.getPixelData = () => new Uint8Array(300 * 150);

    displayImage(this.element, this.image);

    element.addEventListener('cornerstoneimagerendered', function (event) {
      // Assert
      assert.equal(event.target, element);
      assert.equal(event.detail.image, image);
      done();
    });

    // Act
    draw(this.element);
  });

  afterEach(function () {
    disable(this.element);
  });
});
