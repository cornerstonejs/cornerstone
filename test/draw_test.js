import { assert } from 'chai';

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

  it('should throw an error if no image is displayed in the enabled element', function () {
    // Act
    assert.throws(() => draw(this.element));
  });

  it('should draw immediately', function (done) {
    // Arrange
    const element = this.element;
    const image = this.image;

    displayImage(this.element, this.image);

    $(element).on('CornerstoneImageRendered', function (event, eventData) {
      // Assert
      assert.equal(eventData.element, element);
      assert.equal(eventData.image, image);
      done();
    });

    // Act
    draw(this.element);
  });

  afterEach(function () {
    disable(this.element);
  });
});
