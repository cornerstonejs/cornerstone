import { assert } from 'chai'; // eslint-disable-line import/extensions

import enable from '../src/enable.js';
import disable from '../src/disable.js';
import displayImage from '../src/displayImage.js';
import drawImageSync from '../src/internal/drawImageSync.js';
import { addLayer } from '../src/layers.js';
import { getEnabledElement } from '../src/enabledElements.js';

const IMAGE_DATA = [1, 1, 1, 255, 255, 255, 255, 255, 255, 255, 255, 255, 1, 1, 1, 255];
const EMPTY_IMAGE_DATA = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

function createImage () {
  const height = 2;
  const width = 2;
  const getPixelData = () => new Uint8Array([0, 255, 255, 0]);

  return {
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
}


describe('drawImageSync', function () {
  beforeEach(function () {
    const el = document.createElement('div');

    el.style.width = '2px';
    el.style.height = '2px';
    el.style.position = 'absolute';

    document.body.appendChild(el);
    enable(el);

    this.element = el;
    this.enabledElement = getEnabledElement(el);
  });
  afterEach(function () {
    disable(this.element);
    document.body.removeChild(this.element);
  });


  it('should draw the image', function () {
    const image = createImage();

    displayImage(this.element, image);
    drawImageSync(this.enabledElement);

    // Grab the pixel data from the canvas
    const ctx = this.enabledElement.canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, 2, 2);

    // Check it matches what we expect
    assert.deepEqual(
      Array.from(imageData.data),
      IMAGE_DATA
    );
  });


  describe('should validate or resolve required state', function () {
    it('when there is no image or layer', function () {
      const element = this.element;
      const enabledElement = getEnabledElement(element);

      // Add a new layer with no image.
      addLayer(element, undefined);

      // This should not throw
      drawImageSync(enabledElement);

      // We're sure we don't have an image
      assert.isUndefined(enabledElement.image);

      // And our canvas is still empty
      const ctx = this.enabledElement.canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, 2, 2);

      assert.deepEqual(
        Array.from(imageData.data),
        EMPTY_IMAGE_DATA
      );

    });

    it('when element has a layer but no image', function () {
      const element = this.element;
      const enabledElement = getEnabledElement(element);

      // Add a new layer with an image- note that this will also set enabledElement.image.
      const image = createImage();

      addLayer(element, image);

      // This should not throw
      drawImageSync(enabledElement);

      // And we have rendered the image
      const ctx = this.enabledElement.canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, 2, 2);

      assert.deepEqual(
        Array.from(imageData.data),
        IMAGE_DATA
      );
    });

    it('element has only one empty layer', function () {
      const element = this.element;
      const enabledElement = getEnabledElement(element);

      // Add a new layer without an image
      const image = undefined;

      addLayer(element, image);

      // This should not throw
      drawImageSync(enabledElement);

      // Grab the pixel data from the canvas
      const ctx = this.enabledElement.canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, 2, 2);

      // Check our image is empty (has not rendered)
      assert.deepEqual(
        Array.from(imageData.data),
        EMPTY_IMAGE_DATA
      );
    });

  });
});
