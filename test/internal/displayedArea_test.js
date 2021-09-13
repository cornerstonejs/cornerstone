import { assert } from 'chai'; // eslint-disable-line import/extensions

import enable from '../../src/enable.js';
import displayImage from '../../src/displayImage.js';
import draw from '../../src/draw.js';
import { getEnabledElement } from '../../src/enabledElements.js';
import disable from '../../src/disable.js';

describe('displayedArea', function () {
  beforeEach(function () {
    // Arrange
    this.height = 45;
    this.width = 65;
    this.left = 19;
    this.top = 10;
    this.right = 45;
    this.bottom = 36;

    this.getRect = () => ({
      x: this.left,
      y: this.top,
      width: (this.right - this.left) + 1,
      height: (this.bottom - this.top) + 1
    });

    const getPixelData = () => {
      const pixelData = [];
      let index = 0;

      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {

          if ((y === this.top && x === this.left) || (y === this.bottom && x === this.right)) {
            pixelData[index++] = 255; // RED
            pixelData[index++] = 0; // GREEN
            pixelData[index++] = 0; // BLUE
            pixelData[index++] = 255; // ALPHA

          } else {
            pixelData[index++] = 0; // RED
            pixelData[index++] = 255; // GREEN
            pixelData[index++] = 0; // BLUE
            pixelData[index++] = 255; // ALPHA
          }
        }
      }

      return pixelData;
    };

    this.image = {
      imageId: 'testImageDisplayed',
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
      sizeInBytes: this.width * this.height * 2,
      columnPixelSpacing: 1,
      rowPixelSpacing: 1
    };

    this.viewPort = {
      scale: 1,
      // Displayed Area is 1-based
      displayedArea: {
        // Top Left Hand Corner
        tlhc: {
          x: this.getRect().x + 1,
          y: this.getRect().y + 1
        },
        // Bottom Right Hand Corner
        brhc: {
          x: this.getRect().x + this.getRect().width,
          y: this.getRect().y + this.getRect().height
        },
        rowPixelSpacing: 1,
        columnPixelSpacing: 1,
        presentationSizeMode: 'NONE'
      }
    };
  });

  it('displayedArea: should display the area specified in the viewport TRUE SIZE ', function (done) {
    // Arrange
    const canvasWidth = (this.getRect().width).toString();
    const canvasHeight = (this.getRect().height).toString();

    this.element = document.createElement('div');
    this.element.style.width = `${canvasWidth}px`;
    this.element.style.height = `${canvasHeight}px`;

    // Needed for the div to actually have a width.
    document.body.appendChild(this.element);

    enable(this.element);

    this.viewPort.displayedArea.presentationSizeMode = 'TRUE SIZE';

    displayImage(this.element, this.image, this.viewPort);

    this.element.addEventListener('cornerstoneimagerendered', () => {
      const canvas = getEnabledElement(this.element).canvas;
      const canvasContext = canvas.getContext('2d', {
        desynchronized: true
      });
      const imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Assert
      assert.equal(data[0], 255, 'Top/left Pixel Red component must be 255');
      assert.equal(data[data.length - 4], 255, 'Bottom/Right Pixel Red component must be 255');

      done();
    });

    // Act
    draw(this.element);
  });

  it('displayedArea: should display the area specified in the viewport FIT to the Canvas Size', function (done) {
    // Arrange
    const canvasWidth = (this.getRect().width * 2).toString();
    const canvasHeight = (this.getRect().height * 2).toString();

    this.element = document.createElement('div');
    this.element.style.width = `${canvasWidth}px`;
    this.element.style.height = `${canvasHeight}px`;

    // Needed for the div to actually have a width.
    document.body.appendChild(this.element);

    enable(this.element);

    this.viewPort.displayedArea.presentationSizeMode = 'SCALE TO FIT';

    displayImage(this.element, this.image, this.viewPort);

    this.element.addEventListener('cornerstoneimagerendered', () => {
      const canvas = getEnabledElement(this.element).canvas;
      const canvasContext = canvas.getContext('2d', {
        desynchronized: true
      });
      const imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Assert
      assert.isAbove(data[0], 10, 'Top/left Pixel Red component must be greater than 10 due to interpolation');
      assert.isAbove(data[data.length - 4], 10, 'Bottom/Right Pixel Red component must be greater than 10 due to interpolation');

      done();
    });

    // Act
    draw(this.element);
  });

  it('displayedArea: should display the area specified in the viewport TRUE SIZE with irregular image size', function (done) {
    // Arrange
    const canvasWidth = (this.getRect().width).toString();
    const canvasHeight = (this.getRect().height * 2).toString();

    this.element = document.createElement('div');
    this.element.style.width = `${canvasWidth}px`;
    this.element.style.height = `${canvasHeight}px`;

    // Needed for the div to actually have a width.
    document.body.appendChild(this.element);

    enable(this.element);

    this.viewPort.displayedArea.rowPixelSpacing = 2;

    this.viewPort.displayedArea.presentationSizeMode = 'TRUE SIZE';

    displayImage(this.element, this.image, this.viewPort);

    this.element.addEventListener('cornerstoneimagerendered', () => {
      const canvas = getEnabledElement(this.element).canvas;
      const canvasContext = canvas.getContext('2d', {
        desynchronized: true
      });
      const imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Assert
      assert.isAbove(data[0], 10, 'Top/left Pixel Red component must be greater than 10 due to interpolation');
      assert.isAbove(data[data.length - 4], 10, 'Bottom/Right Pixel Red component must be greater than 10 due to interpolation');

      done();
    });

    // Act
    draw(this.element);
  });

  it('displayedArea: should display the area specified in the viewport MAGNIFIED', function (done) {
    // Arrange
    const canvasWidth = (this.getRect().width * 2).toString();
    const canvasHeight = (this.getRect().height * 2).toString();

    this.element = document.createElement('div');
    this.element.style.width = `${canvasWidth}px`;
    this.element.style.height = `${canvasHeight}px`;

    // Needed for the div to actually have a width.
    document.body.appendChild(this.element);

    enable(this.element);

    this.viewPort.displayedArea.rowPixelSpacing = 2;
    this.viewPort.displayedArea.columnPixelSpacing = 2;

    this.viewPort.displayedArea.presentationSizeMode = 'MAGNIFY';

    displayImage(this.element, this.image, this.viewPort);

    this.element.addEventListener('cornerstoneimagerendered', () => {
      const canvas = getEnabledElement(this.element).canvas;
      const canvasContext = canvas.getContext('2d', {
        desynchronized: true
      });
      const imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Assert
      assert.isAbove(data[0], 10, 'Top/left Pixel Red component must be greater than 10 due to interpolation');
      assert.isAbove(data[data.length - 4], 10, 'Bottom/Right Pixel Red component must be greater than 10 due to interpolation');

      done();
    });

    // Act
    draw(this.element);
  });

  afterEach(function () {
    disable(this.element);
    document.body.removeChild(this.element);
  });
});
