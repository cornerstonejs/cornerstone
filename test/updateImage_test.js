import { assert } from 'chai';

import enable from '../src/enable.js';
import displayImage from '../src/displayImage.js';
import updateImage from '../src/updateImage.js';
import disable from '../src/disable.js';

describe('Update a displayed image', function () {
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
  });

  it('should fire CornerstoneImageRendered', function (done) {
    const element = this.element;
    const image = this.image;

    displayImage(element, image);

    // Act
    updateImage(element);

    // Assert
    $(element).on('CornerstoneImageRendered', function (event, eventData) {
      assert.equal(eventData.element, element);
      done();
    });
  });

  it('should throw an Error if the image is not loaded', function () {
    // Act
    assert.throws(() => updateImage(this.element));
  });

  afterEach(function () {
    disable(this.element);
  });
});
