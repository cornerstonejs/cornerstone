import { assert } from 'chai';

import enable from '../src/enable.js';
import displayImage from '../src/displayImage.js';
import drawInvalidated from '../src/drawInvalidated.js';
import disable from '../src/disable.js';
import { getEnabledElement } from '../src/enabledElements.js';
import pubSub from '../src/pubSub.js';

describe('drawInvalidated', function () {
  beforeEach(function () {
    // Arrange
    const height = 2;
    const width = 2;

    const getPixelData = () => new Uint8Array([0, 255, 255, 0]);

    this.image1 = {
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

    this.image2 = {
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

    // Arrange
    this.element1 = document.createElement('div');
    this.element2 = document.createElement('div');

    this.element1.id = 'Element1';
    this.element2.id = 'Element2';

    // Enable the element for which we will test disabling
    enable(this.element1);
    displayImage(this.element1, this.image1);

    // Enable a second element for testing purposes
    enable(this.element2);
    displayImage(this.element2, this.image2);
  });

  it('should draw only the invalidated elements', function (done) {
    // Arrange
    const element1 = this.element1;

    const element2 = this.element2;
    const enabledElement2 = getEnabledElement(this.element2);
    const image2 = this.image2;

    // There must be a timeout before subscribing so that the pubSub event while enabling
    // the element is not fetched (also fires an async CornerstoneImageRendered event).
    setTimeout(function () {
      // Assert
      pubSub(element1).subscribe('CornerstoneImageRendered', function () {
        // If element1 is redrawn, then this test has failed.
        // Only element2 should be redrawn.
        assert.isOk(false);
        done();
      });

      pubSub(element2).subscribe('CornerstoneImageRendered', function (event, eventData) {
        // Make sure element2 is redrawn since it has been invalidated
        assert.equal(eventData.element, element2);
        assert.equal(eventData.image, image2);
        done();
      });

      // Act
      enabledElement2.invalid = true;
      drawInvalidated();
    }, 100);
  });

  it('should draw all invalidated elements', function (done) {
    // Arrange
    const element1 = this.element1;
    const enabledElement1 = getEnabledElement(this.element1);
    const image1 = this.image1;

    const element2 = this.element2;
    const enabledElement2 = getEnabledElement(this.element2);
    const image2 = this.image2;

    // There must be a timeout before subscribing so that the pubSub event while enabling
    // the element is not fetched (also fires an async CornerstoneImageRendered event).
    setTimeout(function () {
      // Assert
      pubSub(element1).subscribe('CornerstoneImageRendered', function (event, eventData) {
        // If element1 is redrawn, then this test has failed.
        // Only element2 should be redrawn.
        assert.equal(eventData.element, element1);
        assert.equal(eventData.image, image1);
        done();
      });

      pubSub(element2).subscribe('CornerstoneImageRendered', function (event, eventData) {
        // Make sure element2 is redrawn since it has been invalidated
        assert.equal(eventData.element, element2);
        assert.equal(eventData.image, image2);
        done();
      });

      // Act
      enabledElement1.invalid = true;
      enabledElement2.invalid = true;
      drawInvalidated();
    }, 100);
  });

  afterEach(function () {
    disable(this.element1);
    disable(this.element2);
  });
});
