import { assert, expect } from 'chai';

import enable from '../src/enable.js';
import updateImage from '../src/updateImage.js';
import disable from '../src/disable.js';
import { getEnabledElement } from '../src/enabledElements.js';
import metaData from '../src/metaData.js';

import {
  addLayer,
  removeLayer,
  getLayer,
  getLayers,
  getVisibleLayers,
  setActiveLayer,
  getActiveLayer
} from '../src/layers.js';

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

  it('addLayers: should add one layer', function () {
    // Arrange
    addLayer(this.element, this.image1);
    updateImage(this.element);

    // Act
    const enabledElement = getEnabledElement(this.element);

    // Assert
    expect(enabledElement.layers).to.be.an('array');
    expect(enabledElement.layers.length).to.equal(1);
  });

  it('addLayers: should fire CornerstoneLayerAdded', function (done) {
    // Arrange
    $(this.element).on('CornerstoneLayerAdded', (event, eventData) => {
      // Assert
      expect(eventData).to.be.an('object');
      expect(eventData);
      done();
    });


    // Act
    addLayer(this.element, this.image1);
    updateImage(this.element);
  });

  it('addLayers: should add two layers', function () {
    // Arrange
    addLayer(this.element, this.image1);
    addLayer(this.element, this.image2);
    updateImage(this.element);

    // Act
    const enabledElement = getEnabledElement(this.element);

    // Assert
    expect(enabledElement.layers).to.be.an('array');
    expect(enabledElement.layers.length).to.equal(2);
  });

  it('should retrieve both of the two layers', function () {
    // Arrange
    addLayer(this.element, this.image1);
    addLayer(this.element, this.image2);
    updateImage(this.element);

    // Act
    const layers = getLayers(this.element);

    // Assert
    expect(layers).to.be.an('array');
    expect(layers.length).to.equal(2);
  });

  it('should remove one of the two layers', function () {
    // Arrange
    const layerId1 = addLayer(this.element, this.image1);
    const layerId2 = addLayer(this.element, this.image2);

    updateImage(this.element);

    // Act
    removeLayer(this.element, layerId1);
    const layers = getLayers(this.element);

    // Assert
    expect(layers).to.be.an('array');
    expect(layers.length).to.equal(1);
    expect(layers[0].layerId).to.equal(layerId2);
  });

  it('should remove both of the two layers', function () {
    // Arrange
    const layerId1 = addLayer(this.element, this.image1);
    const layerId2 = addLayer(this.element, this.image2);

    updateImage(this.element);

    // Act
    removeLayer(this.element, layerId2);
    removeLayer(this.element, layerId1);
    const layers = getLayers(this.element);

    // Assert
    expect(layers).to.be.an('array');
    expect(layers.length).to.equal(0);
  });

  it('should retrieve only the visible layers', function () {
    // Arrange
    addLayer(this.element, this.image1, {
      visible: false
    });
    const layerId2 = addLayer(this.element, this.image2);

    addLayer(this.element, this.image1, {
      opacity: 0
    });
    const layerId4 = addLayer(this.element, this.image2, {
      opacity: 0.2
    });

    updateImage(this.element);

    // Act
    const layers = getVisibleLayers(this.element);

    // Assert
    expect(layers).to.be.an('array');
    expect(layers.length).to.equal(2);
    expect(layers[0].layerId).to.equal(layerId2);
    expect(layers[1].layerId).to.equal(layerId4);
  });

  it('should correctly retrieve the layers by ID', function () {
    // Arrange
    const layerId1 = addLayer(this.element, this.image1);
    const layerId2 = addLayer(this.element, this.image2);

    updateImage(this.element);

    // Act
    const layer1 = getLayer(this.element, layerId1);
    const layer2 = getLayer(this.element, layerId2);

    // Assert
    expect(layer1).to.be.an('object');
    expect(layer1.layerId).to.equal(layerId1);
    expect(layer2).to.be.an('object');
    expect(layer2.layerId).to.equal(layerId2);
  });

  it('should correctly set and retrieve the active layer', function (done) {
    // Arrange
    addLayer(this.element, this.image1);

    const layerId2 = addLayer(this.element, this.image2);

    $(this.element).on('CornerstoneActiveLayerChanged', (event, eventData) => {
      // Assert
      expect(eventData.layerId).to.equal(layerId2);
      done();
    });

    updateImage(this.element);

    // Act
    setActiveLayer(this.element, layerId2);
    const activeLayer = getActiveLayer(this.element);

    // Assert
    expect(activeLayer).to.be.an('object');
    expect(activeLayer.layerId).to.equal(layerId2);
  });

  it('should fail silently if the layer is already enabled', function () {
    // Arrange
    addLayer(this.element, this.image1);
    const layerId2 = addLayer(this.element, this.image2);

    updateImage(this.element);

    // Act
    setActiveLayer(this.element, layerId2);
    setActiveLayer(this.element, layerId2);

    // TODO: See how we can assert that this is working
  });

  it('should throw an error if the layer does not exist', function () {
    // Arrange
    addLayer(this.element, this.image1);
    addLayer(this.element, this.image2);

    updateImage(this.element);

    // Assert
    assert.throws(() => {
      // Act
      setActiveLayer(this.element, 'invalidLayerId');
    });
  });

  afterEach(function () {
    disable(this.element);
  });
});
