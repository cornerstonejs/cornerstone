import { assert } from 'chai';

import enable from '../src/enable.js';
import disable from '../src/disable.js';
import { getEnabledElement, getEnabledElements } from '../src/enabledElements.js';

describe('Disable an Element', function () {
  beforeEach(function () {
    // Arrange
    this.element = document.createElement('div');
    this.element2 = document.createElement('div');

    this.element.id = 'Element1';
    this.element2.id = 'Element2';

    // Enable the element for which we will test disabling
    enable(this.element);

    // Enable a second element for testing purposes
    enable(this.element2);

    // Act
    disable(this.element);
  });

  it('should fire CornerstoneElementDisabled', function () {
    const element = this.element;

    // Assert
    $(element).on('CornerstoneElementDisabled', function (event, eventData) {
      assert.equal(eventData.element, element);
    });
  });

  it('should no longer be available in the enabledElement array', function () {
    const element = this.element;

    // Assert
    assert.throws(() => {
      getEnabledElement(element);
    });
  });

  it('should leave the enabledElement array with one entry', function () {
    // Assert
    const enabledElements = getEnabledElements();

    assert.equal(enabledElements.length, 1);
  });

  it('should throw an error when disabling an undefined element', function () {
    // Assert
    assert.throws(() => disable(undefined));
  });

  afterEach(function () {
    disable(this.element2);
  });
});
