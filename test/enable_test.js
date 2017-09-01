import { assert } from 'chai';

import enable from '../src/enable.js';
import disable from '../src/disable.js';
import { getEnabledElement, getEnabledElements } from '../src/enabledElements.js';
import pubSub from '../src/pubSub.js';

describe('Enable a DOM Element for Canvas Renderer', function () {
  beforeEach(function () {
    // Arrange
    this.element = document.createElement('div');
    this.options = {};
  });

  it('should fire CornerstonePreRender', function (done) {
    const element = this.element;
    const options = this.options;

    // Assert
    pubSub(element).subscribe('CornerstonePreRender', function (event, eventData) {
      assert.equal(eventData.enabledElement.element, element);
      done();
    });

    // Act
    enable(element, options);
  });

  it('should be available in the enabledElement array', function () {
    const element = this.element;
    const options = this.options;

    // Act
    enable(element, options);

    // Assert
    const enabledElement = getEnabledElement(element);

    assert.equal(enabledElement.element, element);
  });

  it('should be the only entry in the enabledElement array', function () {
    const element = this.element;
    const options = this.options;

    // Act
    enable(element, options);

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
