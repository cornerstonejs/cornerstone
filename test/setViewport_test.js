import { assert } from 'chai';

import enable from '../src/enable.js';
import displayImage from '../src/displayImage.js';
import setViewport from '../src/setViewport.js';
import getViewport from '../src/getViewport.js';
import disable from '../src/disable.js';

const MIN_WINDOW_WIDTH = 0.000001;
const MIN_VIEWPORT_SCALE = 0.0001;

describe('Set an enabled element\'s viewport', function () {
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

  it('should apply viewport settings if provided', function () {
    const element = this.element;

    const newViewport = {
      scale: 3.0,
      translation: {
        x: 2,
        y: 2
      },
      voi: {
        windowWidth: 11,
        windowCenter: 16
      },
      invert: false,
      pixelReplication: false,
      rotation: 91,
      hflip: false,
      vflip: false
    };

    // Act
    setViewport(element, newViewport);

    // Assert
    const viewport = getViewport(element);

    Object.keys(newViewport).forEach((key) => {
      assert.deepEqual(newViewport[key], viewport[key]);
    });
  });

  it('should prevent windowWidth from getting too small', function () {
    const element = this.element;

    // Arrange
    this.viewport.voi.windowWidth = 0.0000000000001;

    // Act
    setViewport(element, this.viewport);

    // Assert
    const viewport = getViewport(element);

    assert.equal(viewport.voi.windowWidth, MIN_WINDOW_WIDTH);
  });

  it('should prevent scale from getting too small', function () {
    const element = this.element;

    // Arrange
    this.viewport.scale = 0.0000000000001;

    // Act
    setViewport(element, this.viewport);

    // Assert
    const viewport = getViewport(element);

    assert.equal(viewport.scale, MIN_VIEWPORT_SCALE);
  });

  it('should normalize rotation values above 359 degrees', function () {
    const element = this.element;

    // Arrange
    this.viewport.rotation = 365;

    // Act
    setViewport(element, this.viewport);

    // Assert
    const viewport = getViewport(element);

    assert.equal(viewport.rotation, 5);
  });

  it('should normalize rotation values below 0 degrees', function () {
    const element = this.element;

    // Arrange
    this.viewport.rotation = -5;

    // Act
    setViewport(element, this.viewport);

    // Assert
    const viewport = getViewport(element);

    assert.equal(viewport.rotation, 355);
  });

  afterEach(function () {
    disable(this.element);
  });
});
