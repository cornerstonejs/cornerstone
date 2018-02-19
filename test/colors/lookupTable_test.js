import { assert } from 'chai';
import LookupTable from '../../src/colors/lookupTable.js';

describe('lookupTable class', function () {
  beforeEach(function () {
    this.lt = new LookupTable();
  });

  it('builds a table and lets the user set the table\'s ramp', function () {
    this.lt.setRamp('scurve');
    this.lt.build(true);
    this.lt.setRamp('sqrt');
    this.lt.build(true);
    this.lt.setRamp('linear');
    this.lt.build(true);
  });

  it('allows for the conversion of a scalart to an rgba color value', function () {
    this.lt.getColor(2);
    this.lt.getColor(-1);
  });

  it('allows for setting the hue, saturation, value, and alpha ranges, along with the table and input ranges', function () {
    this.lt.setHueRange(0.01, 0.99);
    assert.equal(this.lt.HueRange[0], 0.01);
    assert.equal(this.lt.HueRange[1], 0.99);

    this.lt.setSaturationRange(0.01, 0.99);
    assert.equal(this.lt.SaturationRange[0], 0.01);
    assert.equal(this.lt.SaturationRange[1], 0.99);

    this.lt.setValueRange(0.01, 0.99);
    assert.equal(this.lt.ValueRange[0], 0.01);
    assert.equal(this.lt.ValueRange[1], 0.99);

    this.lt.setAlphaRange(0.01, 0.99);
    assert.equal(this.lt.AlphaRange[0], 0.01);
    assert.equal(this.lt.AlphaRange[1], 0.99);

    this.lt.setTableRange(64, 128);
    assert.equal(this.lt.TableRange[0], 64);
    assert.equal(this.lt.TableRange[1], 128);

    this.lt.setRange(64, 128);
    assert.equal(this.lt.InputRange[0], 64);
    assert.equal(this.lt.InputRange[1], 128);
  });
});
