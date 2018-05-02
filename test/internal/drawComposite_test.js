import { assert } from 'chai'; // eslint-disable-line import/extensions

import enable from '../../src/enable.js';
import draw from '../../src/draw.js';
import drawCompositeImage from '../../src/internal/drawCompositeImage.js';
import disable from '../../src/disable.js';
import setViewport from '../../src/setViewport.js';
import getViewport from '../../src/getViewport.js';
import { getEnabledElement } from '../../src/enabledElements.js';

import {
  addLayer, getLayer
} from '../../src/layers.js';

describe('layers', function () {
  beforeEach(function () {
    // Arrange
    this.element = document.createElement('div');
    // Need to set width/height to properly calculate the scale
    this.element.style.width = '2px';
    this.element.style.height = '2px';
    this.element.style.position = 'absolute';
    document.body.appendChild(this.element);

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
      sizeInBytes: width * height * 2,
      columnPixelSpacing: 1,
      rowPixelSpacing: 1
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
      sizeInBytes: width * height * 2,
      columnPixelSpacing: 2,
      rowPixelSpacing: 2
    };

    enable(this.element);
  });

  it('drawComposite: should draw a composite image', function (done) {
    // Arrange
    addLayer(this.element, this.image1);
    addLayer(this.element, this.image2);

    this.element.addEventListener('cornerstoneimagerendered', (event) => {
      // Assert
      assert.equal(event.target, this.element);
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

    this.element.addEventListener('cornerstoneimagerendered', (event) => {
      // Assert
      assert.equal(event.target, this.element);
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

    this.element.addEventListener('cornerstoneimagerendered', (event) => {
      // Assert
      assert.equal(event.target, this.element);
      done();
    });

    // Act
    draw(this.element);
  });

  it('drawComposite: should sync the layers scale', function () {
    // Arrange
    const layerId1 = addLayer(this.element, this.image1);
    const layerId2 = addLayer(this.element, this.image2);
    const layer1 = getLayer(this.element, layerId1);
    const layer2 = getLayer(this.element, layerId2);
    const layerScale1 = layer1.viewport.scale;
    const layerScale2 = layer2.viewport.scale;
    const factor = 2;
    const expectedLayerScale1 = layerScale1 * factor;
    const expectedLayerScale2 = layerScale2 * factor;
    const enabledElement = getEnabledElement(this.element);
    const viewport = getViewport(this.element);

    // Act
    // Must render the layers at least 1 time before scaling to setup the initial scale ratio
    drawCompositeImage(enabledElement, true);

    viewport.scale *= factor;
    setViewport(this.element, viewport);

    drawCompositeImage(enabledElement, true);

    // Assert
    assert.equal(layer1.viewport.scale, expectedLayerScale1);
    assert.equal(layer2.viewport.scale, expectedLayerScale2);
  });

  it('drawComposite: should NOT sync the layers scale', function () {
    // Arrange
    const layerId1 = addLayer(this.element, this.image1);
    const layerId2 = addLayer(this.element, this.image2);
    const layer1 = getLayer(this.element, layerId1);
    const layer2 = getLayer(this.element, layerId2);
    const layerScale1 = layer1.viewport.scale;
    const layerScale2 = layer2.viewport.scale;
    const factor = 2;
    const expectedLayerScale1 = layerScale1 * factor;
    const expectedLayerScale2 = layerScale2;
    const enabledElement = getEnabledElement(this.element);
    const viewport = getViewport(this.element);

    enabledElement.syncViewports = false;

    // Act
    // Must render the layers at least 1 time before scaling to setup the initial scale ratio
    drawCompositeImage(enabledElement, true);

    viewport.scale *= factor;
    setViewport(this.element, viewport);

    drawCompositeImage(enabledElement, true);

    // Assert
    assert.equal(layer1.viewport.scale, expectedLayerScale1);
    assert.equal(layer2.viewport.scale, expectedLayerScale2);
  });

  afterEach(function () {
    disable(this.element);
  });
});
