import { assert } from 'chai';

import enable from '../src/enable.js';
import displayImage from '../src/displayImage.js';
import disable from '../src/disable.js';
import { getEnabledElement } from '../src/enabledElements.js';

describe('Display an image', function () {
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
  });

  it('should fire CornerstoneNewImage', function (done) {
    const element = this.element;
    const image = this.image;

    $(element).on('CornerstoneNewImage', function (event, eventData) {
      // Assert
      assert.equal(eventData.element, element);
      assert.equal(eventData.image, image);
      done();
    });

    // Act
    displayImage(element, image);
  });

  it('should apply viewport settings if provided', function (done) {
    const element = this.element;
    const image = this.image;
    const viewport = {
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

    $(element).on('CornerstoneNewImage', function (event, eventData) {
      // Assert
      assert.equal(eventData.element, element);
      assert.equal(eventData.image, image);

      // Check that all of the viewport properites we specified are
      // now set in the enabled element's viewport. Use the loop
      // because the enabledElement viewport will have extra properties
      // such as modalityLUT and voiLUT.
      Object.keys(viewport).forEach((key) => {
        assert.deepEqual(eventData.viewport[key], viewport[key]);
      });
      done();
    });

    // Act
    displayImage(element, image, viewport);
  });

  it('should update the viewport settings if run twice', function () {
    const element = this.element;
    const image = this.image;
    const viewport = this.viewport;
    // Act

    displayImage(element, image, viewport);

    viewport.scale = 1.0;
    displayImage(element, image, viewport);

    const enabledElement = getEnabledElement(element);

    // Check that all of the viewport properites we specified are
    // now set in the enabled element's viewport. Use the loop
    // because the enabledElement viewport will have extra properties
    // such as modalityLUT and voiLUT.
    Object.keys(viewport).forEach((key) => {
      assert.deepEqual(enabledElement.viewport[key], viewport[key]);
    });
  });

  it('should calculate a frameRate when the same element is updated twice', function (done) {
    const element = this.element;
    const image = this.image;
    const viewport = this.viewport;

    $(element).on('CornerstoneNewImage', function (event, eventData) {
      // Assert
      assert.equal(eventData.element, element);
      assert.equal(eventData.image, image);

      if (eventData.frameRate) {
        // Note: FrameRate is returned as a String since it uses toFixed
        assert.equal(eventData.frameRate, '1');
        assert.isDefined(eventData.enabledElement.lastImageTimeStamp);
        done();
      }
    });

    // Act
    displayImage(element, image, viewport);

    setTimeout(function () {
      viewport.scale = 1.0;

      displayImage(element, image, viewport);
    }, 1000);
  });

  it('should throw an Error if the element is undefined', function () {
    assert.throws(() => displayImage(undefined, this.image));
  });

  it('should throw an Error if the image is undefined', function () {
    assert.throws(() => displayImage(this.element, undefined));
  });

  afterEach(function () {
    disable(this.element);
  });
});
