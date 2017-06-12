import { assert } from 'chai';

import getModalityLUT from '../../src/internal/getModalityLUT.js';

describe('getModalityLUT', function () {
  beforeEach(function () {
    // Arrange
    this.slope = 2;
    this.intercept = 5;
    this.modalityLUT = {
      firstValueMapped: 0,
      lut: [0, 128, 255]
    };
  });

  it('should create a linear modality LUT function', function () {
    // Arrange
    // Act
    const mlutfn = getModalityLUT(this.slope, this.intercept);

    // Assert
    assert.equal(mlutfn(-1), 3);
    assert.equal(mlutfn(0), 5);
    assert.equal(mlutfn(1), 7);
    assert.equal(mlutfn(2), 9);
    assert.equal(mlutfn(3), 11);
  });

  it('should create a non-linear modality LUT function', function () {
    // Act
    const mlutfn = getModalityLUT(this.slope, this.intercept, this.modalityLUT);

    // Assert
    assert.equal(mlutfn(-1), 0);
    assert.equal(mlutfn(0), 0);
    assert.equal(mlutfn(1), 128);
    assert.equal(mlutfn(2), 255);
    assert.equal(mlutfn(3), 255);
  });
});
