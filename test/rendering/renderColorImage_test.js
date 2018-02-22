import { assert } from 'chai';

import enable from '../../src/enable.js';
import displayImage from '../../src/displayImage.js';
import disable from '../../src/disable.js';
import { renderColorImage } from '../../src/rendering/renderColorImage.js';
import { getEnabledElement } from '../../src/enabledElements.js';
import setViewport from '../../src/setViewport.js';
// import getCanvas from '../../src/internal/getCanvas.js';

describe('renderColorImage', function () {
  beforeEach(function () {
    // Arrange
    this.element = document.createElement('div');
    const height = 256;
    const width = 256;

    enable(this.element);

    const getPixelData = () => new Uint8Array([0, 255, 255, 0]);
    const enabledElement = getEnabledElement(this.element);
    const canvasContext = enabledElement.canvas.getContext('2d');
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

    // TODO: check that renderCanvas doesn't exist

    renderColorImage(enabledElement, false);

    const renderCanvas = enabledElement.renderingTools.renderCanvas;

    // Act
    // TODO: add additional checks?
    // Checking that render canvas exists and that its dimensions match the image dimensions
    assert.exists(renderCanvas);
    assert.equal(renderCanvas.height, image.height);
    assert.equal(renderCanvas.width, image.width);
  });

  it('should create a render canvas, then recycle the existing render canvas when applied again', function () {
    // Arrange
    const element = this.element;
    const image = this.image;
    const enabledElement = getEnabledElement(element);

    // Act
    renderColorImage(enabledElement, true);
    const renderCanvas1 = Object.assign({}, enabledElement.renderingTools.renderCanvas);
    renderColorImage(enabledElement, false);
    const renderCanvas2 = Object.assign({}, enabledElement.renderingTools.renderCanvas);
    assert.deepEqual(renderCanvas1, renderCanvas2);
    renderColorImage(enabledElement, true);
    const renderCanvas3 = Object.assign({}, enabledElement.renderingTools.renderCanvas);
    assert.deepEqual(renderCanvas1, renderCanvas3);

  });


  it('should fail to render color image without image or enabled element', function () {
    // Arrange
    const element = this.element;
    const enabledElement = getEnabledElement(element);

    enabledElement.image = undefined;

    // Act
    assert.throws(() => renderColorImage(enabledElement, false));
    assert.throws(() => renderColorImage(undefined, false), Error, 'renderColorImage: enabledElement parameter must not be undefined');
  });

  afterEach(function () {
    disable(this.element);
  });

});
