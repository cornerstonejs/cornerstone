import { assert } from 'chai';

import enable from '../src/enable.js';
import getViewport from '../src/getViewport.js';
import disable from '../src/disable.js';

describe('Set an enabled element\'s viewport', function () {
  beforeEach(function () {
    // Arrange
    this.element = document.createElement('div');
    enable(this.element);
  });

  it('should fail silently if no viewport settings are present', function () {
    const element = this.element;

    // Act
    const viewport = getViewport(element);

    // Assert
    assert.isUndefined(viewport);
  });

  afterEach(function () {
    disable(this.element);
  });
});
