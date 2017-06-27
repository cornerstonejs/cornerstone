import { assert } from 'chai';

import enable from '../../src/enable.js';
import draw from '../../src/draw.js';
import disable from '../../src/disable.js';
import metaData from '../../src/metaData.js';

import {
  addLayer
} from '../../src/layers.js';

describe('layers', function () {
  beforeEach(function () {
    // Arrange
    this.element = document.createElement('div');
    const height = 2;
    const width = 2;

    const getPixelData = () => new Uint8Array([0, 255, 255, 0]);

    this.image1 = {
      imageId: 'exampleImageId1',
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

    const getPixelData2 = () => new Uint8Array([5, 6, 7, 8]);

    this.image2 = {
      imageId: 'exampleImageId2',
      minPixelValue: 0,
      maxPixelValue: 255,
      slope: 1.0,
      intercept: 0,
      windowCenter: 127,
      windowWidth: 256,
      getPixelData: getPixelData2,
      rows: height,
      columns: width,
      height,
      width,
      color: false,
      sizeInBytes: width * height * 2
    };

    const imagePlaneMetadata = {
      exampleImageId1: {
        columnPixelSpacing: 1,
        rowPixelSpacing: 1
      },
      exampleImageId2: {
        columnPixelSpacing: 2,
        rowPixelSpacing: 2
      }
    };

    metaData.addProvider((type, imageId) => {
      if (type === 'imagePlane') {
        return imagePlaneMetadata[imageId];
      }
    });

    enable(this.element);
  });

  it('drawComposite: should draw a composite image', function (done) {
    // Arrange
    addLayer(this.element, this.image1);
    addLayer(this.element, this.image2);

    $(this.element).on('CornerstoneImageRendered', (event, eventData) => {
      // Assert
      assert.equal(eventData.element, this.element);
      done();
    });

    // Act
    draw(this.element);
  });

  it('drawComposite: should draw a composite image with optional opacity', function (done) {
    // Arrange
    addLayer(this.element, this.image1);
    addLayer(this.element, this.image2, {
      opacity: 0.7
    });

    $(this.element).on('CornerstoneImageRendered', (event, eventData) => {
      // Assert
      assert.equal(eventData.element, this.element);
      done();
    });

    // Act
    draw(this.element);
  });

  it('drawComposite: should draw a composite image with optional colormap', function (done) {
    // Arrange
    addLayer(this.element, this.image1);
    addLayer(this.element, this.image2, {
      colormap: 'Blues'
    });

    $(this.element).on('CornerstoneImageRendered', (event, eventData) => {
      // Assert
      assert.equal(eventData.element, this.element);
      done();
    });

    // Act
    draw(this.element);
  });

  afterEach(function () {
    disable(this.element);
  });
});
