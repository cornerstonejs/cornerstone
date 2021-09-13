import { assert } from 'chai'; // eslint-disable-line import/extensions

import enable from '../../src/enable.js';
import displayImage from '../../src/displayImage.js';
import disable from '../../src/disable.js';
import { renderColorImage } from '../../src/rendering/renderColorImage.js';
import { getEnabledElement } from '../../src/enabledElements.js';
import setViewport from '../../src/setViewport.js';
import draw from '../../src/draw.js';
import {
  addLayer
} from '../../src/layers.js';

describe('renderColorImage', function () {
  beforeEach(function () {
    // Arrange
    this.element = document.createElement('div');
    const height = 256;
    const width = 256;

    enable(this.element);

    const enabledElement = getEnabledElement(this.element);
    const canvasContext = enabledElement.canvas.getContext('2d', {
      desynchronized: true
    });
    const imageData = canvasContext.createImageData(width, height);
    const pixelData = imageData.data;
    const rnd = Math.round(Math.random() * 255);
    let index = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
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
      rows: height,
      columns: width,
      height,
      width,
      color: true,
      sizeInBytes: width * height * 2
    };

    this.viewport = {
      scale: 1.0,
      translation: {
        x: 0,
        y: 0
      },
      voi: {
        windowWidth: 255,
        windowCenter: 128
      },
      invert: false,
      pixelReplication: false,
      rotation: 0,
      hflip: false,
      vflip: false
    };

    displayImage(this.element, this.image);
    setViewport(this.element, this.viewport);
  });

  it('should create a render canvas where there was initially none', function () {
    // Arrange
    const element = this.element;
    const image = this.image;
    const enabledElement = getEnabledElement(element);

    // Act
    renderColorImage(enabledElement, false);
    const renderCanvas = enabledElement.renderingTools.renderCanvas;

    // Assert
    // Check that render canvas exists now and that its dimensions match the image dimensions
    assert.exists(renderCanvas);
    assert.equal(renderCanvas.height, image.height);
    assert.equal(renderCanvas.width, image.width);
  });

  it('should reuse old render canvas when invalidated !== true', function () {
    // Arrange
    const element = this.element;
    const image = this.image;
    const enabledElement = getEnabledElement(element);

    // Act
    renderColorImage(enabledElement, true);
    const renderCanvas1 = enabledElement.renderingTools.renderCanvas.cloneNode();

    // Changing image measurements shouldn't affect renderCanvas when invalidated !== true
    image.height = 500;
    this.viewport.height = 500;

    renderColorImage(enabledElement, false);
    const renderCanvas2 = enabledElement.renderingTools.renderCanvas.cloneNode();

    // Assert
    assert.deepEqual(renderCanvas1, renderCanvas2);
  });

  it('should create a new render canvas with updated measurements when invalidated === true', function () {
    // Arrange
    const element = this.element;
    const image = this.image;
    const enabledElement = getEnabledElement(element);

    // Act
    renderColorImage(enabledElement, true);
    const renderCanvas1 = enabledElement.renderingTools.renderCanvas.cloneNode();

    image.height = 500;
    this.viewport.height = 500;

    renderColorImage(enabledElement, true);
    const renderCanvas2 = enabledElement.renderingTools.renderCanvas.cloneNode();

    // Assert
    assert.notDeepEqual(renderCanvas1, renderCanvas2);
  });

  it('should fail to render color image without image or enabled element', function () {
    // Arrange
    const element = this.element;
    const enabledElement = getEnabledElement(element);

    enabledElement.image = undefined;

    // Assert
    assert.throws(() => renderColorImage(enabledElement, false));
    assert.throws(() => renderColorImage(undefined, false), Error, 'renderColorImage: enabledElement parameter must not be undefined');
  });

  it('should successfully add color layer', function (done) {
    // Arrange
    // Construct an additional color image to layer
    const width = 256;
    const height = 256;
    const enabledElement = getEnabledElement(this.element);
    const canvasContext = enabledElement.canvas.getContext('2d', {
      desynchronized: true
    });
    const imageData2 = canvasContext.createImageData(width, height);
    const pixelData2 = imageData2.data;
    const rnd = Math.round(Math.random() * 255);
    let index = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        pixelData2[index++] = 0; // RED
        pixelData2[index++] = (x + rnd) % 256; // GREEN
        pixelData2[index++] = 0; // BLUE
        pixelData2[index++] = 255; // ALPHA
      }
    }
    canvasContext.putImageData(imageData2, 0, 0);

    function getPixelData2 () {
      return pixelData2;
    }

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
      color: true,
      sizeInBytes: width * height * 2
    };

    addLayer(this.element, this.image2, {
      opacity: 0.7
    });

    this.element.addEventListener('cornerstoneimagerendered', (event) => {
      // Assert
      assert.equal(event.target, this.element);
      done();
    });

    // Act
    draw(this.element);
  });

  afterEach(function () {
    disable(this.element);
  });

});
