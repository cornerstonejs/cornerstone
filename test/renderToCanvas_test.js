import { assert } from 'chai';

import renderToCanvas from '../src/rendering/renderToCanvas.js'
import enable from '../src/enable.js';
import getTransform from '../src/internal/getTransform.js'
import displayImage from '../src/displayImage.js';
import canvasToPixel from '../src/canvasToPixel.js';
import disable from '../src/disable.js';
import { getEnabledElement } from '../src/enabledElements.js';
//import calculateTransform from '../src/internal/calculateTransform.js';



describe('renderToCanvas', function () {
  beforeEach(function () {
    // Arrange
    this.element = document.createElement('div');
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

    enable(this.element);
  });

  it('should store one image on the existing canvas, then ', function () {
    // Arrange
    let enabledElement = getEnabledElement(this.element)

    // Act
    renderToCanvas(enabledElement.canvas, this.image);

  });

  afterEach(function () {
    disable(this.element);
  });
});