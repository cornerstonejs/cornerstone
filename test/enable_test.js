import { assert } from 'chai'; // eslint-disable-line import/extensions
import { events } from '../src/events.js';
import enable from '../src/enable.js';
import disable from '../src/disable.js';
import {
  getEnabledElement,
  getEnabledElements
} from '../src/enabledElements.js';

describe('Enable a DOM Element for Canvas Renderer', function () {
  beforeEach(function () {
    // Arrange
    this.element = document.createElement('div');
    const options = {};

    // Act
    enable(this.element, options);
  });

  it('should fire CornerstoneElementEnabled', function (done) {
    const element = document.createElement('div');

    element.id = 'target-element';

    // Assert
    const handler = function (event) {
      assert.equal(event.detail.element.getAttribute('id'), element.id);

      // Clean-up
      events.removeEventListener('cornerstoneelementenabled', handler);
      disable(element);
      done();
    };

    events.addEventListener('cornerstoneelementenabled', handler);
    enable(element, {});
  });

  it('should fire CornerstonePreRender', function (done) {
    // Arrange
    const element = document.createElement('div');

    element.addEventListener('cornerstoneprerender', function (event) {
      assert.equal(event.target, element);

      // Cleanup
      disable(element);
      done();
    });

    // Act
    enable(element, {});

    // Assert
    const enabledElement = getEnabledElement(element);

    assert.equal(enabledElement.element, element);
  });

  it('should be available in the enabledElement array', function () {
    const element = this.element;

    // Assert
    const enabledElement = getEnabledElement(element);

    assert.equal(enabledElement.element, element);
  });

  it('should be the only entry in the enabledElement array', function () {
    // Assert
    const enabledElements = getEnabledElements();

    assert.equal(enabledElements.length, 1);
  });

  /* it('should be retrievable by the displayed imageId', function() {
  });*/

  afterEach(function () {
    disable(this.element);
  });
});
