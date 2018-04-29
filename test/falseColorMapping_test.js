import { assert } from 'chai'; // eslint-disable-line import/extensions
import { convertImageToFalseColorImage, restoreImage } from '../src/falseColorMapping.js';
import enable from '../src/enable.js';
import displayImage from '../src/displayImage.js';
import disable from '../src/disable.js';

describe('falseColorMapping', function () {
  beforeEach(function () {
    // Arrange
    this.element = document.createElement('div');
    const options = {};

    const height = 2;
    const width = 2;

    const getPixelData = () => new Uint8Array([1, 4, 2, 10]);

    this.colormap = 'Hot Iron';

    this.image = {
      imageId: 'exampleImageId',
      minPixelValue: 0,
      maxPixelValue: 255,
      slope: 1.0,
      intercept: 0,
      windowCenter: 120,
      windowWidth: 252,
      getPixelData,
      rows: height,
      columns: width,
      height,
      width,
      color: false,
      sizeInBytes: width * height * 2
    };

    this.viewport = {
      scale: 2.0,
      translation: {
        x: 1,
        y: 1
      },
      voi: {
        windowWidth: 10,
        windowCenter: 15
      },
      invert: true,
      pixelReplication: true,
      rotation: 90,
      hflip: true,
      vflip: true
    };

    enable(this.element, options);

    displayImage(this.element, this.image, this.viewport);

  });

  it('convertImageToFalseColorImage', function () {

    // Act
    const newColorSet = convertImageToFalseColorImage(this.image, this.colormap);

    // Assert
    assert.isTrue(newColorSet);
    assert.equal(255, this.image.windowWidth);
    assert.equal(128, this.image.windowCenter);
    assert.equal(0, this.image.minPixelValue);
    assert.equal(255, this.image.maxPixelValue);
    assert.deepEqual(this.colormap, this.image.colormapId);
  });

  it('should restore image', function () {
    // Act
    const newColorSet = convertImageToFalseColorImage(this.image, this.colormap);

    // Assert
    assert.isTrue(newColorSet);
    assert.typeOf(this.image.restore, 'function');

    // Act
    const imageRestored = restoreImage(this.image);

    // Assert
    assert.isTrue(imageRestored);

  });

  it('should not restore image', function () {

    // Act
    const imageRestored = restoreImage(this.image);

    // Assert
    assert.isNotTrue(imageRestored);

  });

  afterEach(function () {
    disable(this.element);
  });

});
