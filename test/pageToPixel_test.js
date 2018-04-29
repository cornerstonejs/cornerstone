import { assert } from 'chai'; // eslint-disable-line import/extensions

import enable from '../src/enable.js';
import displayImage from '../src/displayImage.js';
import { getEnabledElement } from '../src/enabledElements.js';
import setViewport from '../src/setViewport.js';
import pageToPixel from '../src/pageToPixel.js';
import disable from '../src/disable.js';

describe('pageToPixel', function () {
  beforeEach(function () {
    // Arrange
    this.element = document.createElement('div');
    const height = 256;
    const width = 256;

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
      scale: 1.0,
      translation: {
        x: 0,
        y: 0
      },
      voi: {
        windowWidth: 256,
        windowCenter: 127
      },
      invert: false,
      pixelReplication: false,
      rotation: 0,
      hflip: false,
      vflip: false
    };

  });

  it('should convert points in the page coordinate system to equivalent points in the pixel coordinate system', function () {
    // Arrange
    enable(this.element);
    displayImage(this.element, this.image);

    const element = this.element;
    const enabledElement = getEnabledElement(this.element);

    enabledElement.canvas.width = 256;
    enabledElement.canvas.height = 256;

    setViewport(element, this.viewport);

    // Act
    const convertedPoint = pageToPixel(element, 10, 10);

    assert.deepEqual(convertedPoint, {
      x: 10,
      y: 10 });
  });

  it('should throw an error if the image is undefined', function () {
    enable(this.element);
    displayImage(this.element, this.image);

    const element = this.element;
    const enabledElement = getEnabledElement(this.element);

    enabledElement.canvas.width = 256;
    enabledElement.canvas.height = 256;

    setViewport(element, this.viewport);

    enabledElement.image = undefined;

    assert.throws(() => pageToPixel(this.element, 10, 10));

  });

  afterEach(function () {
    disable(this.element);
  });
});
