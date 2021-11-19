import { assert, expect } from 'chai'; // eslint-disable-line import/extensions

import renderToCanvas from '../../src/rendering/renderToCanvas.js';
import { getEnabledElement } from '../../src/enabledElements.js';

describe('renderToCanvas', function () {
  beforeEach(function () {
    // Arrange
    this.canvas1 = document.createElement('canvas');

    this.height = 256;
    this.width = 256;

    const canvasContext = this.canvas1.getContext('2d', {
      desynchronized: true
    });
    const imageData = canvasContext.createImageData(this.width, this.height);
    const rnd = Math.round(Math.random() * 255);
    const pixelData = imageData.data;
    let index = 0;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        pixelData[index++] = (x + rnd) % 256; // RED
        pixelData[index++] = 0; // GREEN
        pixelData[index++] = 0; // BLUE
        pixelData[index++] = 255; // ALPHA
      }
    }

    canvasContext.putImageData(imageData, 0, 0);

    function getPixelData () {
      return pixelData;
    }

    this.image = {
      imageId: 'exampleImageId',
      minPixelValue: 0,
      maxPixelValue: 255,
      slope: 1.0,
      intercept: 0,
      windowCenter: 127,
      windowWidth: 256,
      getPixelData,
      rows: this.height,
      columns: this.width,
      height: this.height,
      width: this.width,
      color: true,
      sizeInBytes: this.width * this.height * 2
    };
  });

  it('should render an image on the existing canvas, then ', function (done) {
    // Arrange
    const renderCanvas1 = document.createElement('canvas');
    const viewport = { hflip: true };
    const options = { renderer: 'webgl',
      desynchronized: true,
      preserveDrawingBuffer: true };

    renderCanvas1.width = this.width;
    renderCanvas1.height = this.height;

    renderCanvas1.addEventListener('cornerstoneimagerendered', (event) => {
      // Assert
      assert.equal(event.target, renderCanvas1);

      expect(function () {
        getEnabledElement(event.target);
      }).to.throw('element not enabled');

      done();
    });

    // Act
    renderToCanvas(renderCanvas1, this.image, viewport, options);

    const canvasContext1 = this.canvas1.getContext('2d', {
      desynchronized: true
    });
    const imageData1 = canvasContext1.createImageData(this.width, this.height);
    const pixelData1 = imageData1.data;

    const canvasContext2 = renderCanvas1.getContext('2d', {
      desynchronized: true
    });
    const imageData2 = canvasContext2.createImageData(this.width, this.height);
    const pixelData2 = imageData2.data;

    // Assert
    assert.deepEqual(pixelData1, pixelData2);
  });
});
