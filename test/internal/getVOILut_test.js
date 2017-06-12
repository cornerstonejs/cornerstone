import { assert } from 'chai';

import getVOILut from '../../src/internal/getVOILut.js';

describe('getVOILut', function () {
  beforeEach(function () {
    // Arrange
    this.windowWidth = 255;
    this.windowCenter = 127;

    this.voiLUT = {
      firstValueMapped: 0,
      numBitsPerEntry: 8,
      lut: [0, 128, 255]
    };

    // TODO: Add another test case for a VOI LUT with
    // numBitsPerEntry > 8
    /*
    this.voiLUT2 = {
      firstValueMapped: 0,
      numBitsPerEntry: 16,
      lut: [0, 128, 255]
    };
    */
  });

  it('should create a linear VOI LUT function', function () {
    // Act
    const vlutfn = getVOILut(this.windowWidth, this.windowCenter);

    // Assert
    const delta = 0.001;

    assert.approximately(vlutfn(-1), -0.5, delta);
    assert.approximately(vlutfn(0), 0.5, delta);
    assert.approximately(vlutfn(1), 1.5, delta);
    assert.approximately(vlutfn(2), 2.5, delta);
    assert.approximately(vlutfn(3), 3.5, delta);
    assert.approximately(vlutfn(256), 256.5, delta);
  });

  it('should create a non-linear VOI LUT function', function () {
    // Act
    const vlutfn = getVOILut(this.windowWidth, this.windowCenter, this.voiLUT);

    // Assert
    assert.equal(vlutfn(-1), 0);
    assert.equal(vlutfn(0), 0);
    assert.equal(vlutfn(1), 128);
    assert.equal(vlutfn(2), 255);
    assert.equal(vlutfn(3), 255);
    assert.equal(vlutfn(256), 255);
  });
});
