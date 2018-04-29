import { assert } from 'chai'; // eslint-disable-line import/extensions

import getCanvas from '../../src/internal/getCanvas.js';

describe('getCanvas', function () {
  beforeEach(function () {
    this.parentElement = document.createElement('div');
  });

  describe('when a canvas is not available in the DOM', function () {
    it('should create a canvas and append it to the parent element', function () {
      const canvasCreated = getCanvas(this.parentElement);
      const canvasSelected = this.parentElement.querySelector('canvas.cornerstone-canvas');

      assert.exists(canvasCreated);
      assert.equal(canvasCreated, canvasSelected);
    });

    it('should return the same canvas if called twice', function () {
      const firstCanvas = getCanvas(this.parentElement);
      const secondCanvas = getCanvas(this.parentElement);
      const canvasCount = this.parentElement.getElementsByTagName('canvas').length;

      assert.equal(canvasCount, 1);
      assert.equal(firstCanvas, secondCanvas);
    });
  });

  describe('when a canvas is already available in the DOM', function () {
    beforeEach(function () {
      this.canvas = document.createElement('canvas');
      this.canvas.classList.add('cornerstone-canvas');
      this.parentElement.appendChild(this.canvas);
    });

    it('should return the canvas that already exists instead of creating a new one', function () {
      const canvasReturned = getCanvas(this.parentElement);
      const canvasCount = this.parentElement.getElementsByTagName('canvas').length;

      assert.equal(canvasCount, 1);
      assert.equal(canvasReturned, this.canvas);
    });
  });
});
