import { assert } from 'chai';

import LookupTable from '../src/colors/lookupTable';

describe('lookupTable class', function () {
  beforeEach(function () {
    this.lt = new LookupTable();
  });

  it("builds a table and lets the user set the table's ramp" , function () {
    this.lt.setRamp('scurve');
    this.lt.build(true);
    this.lt.setRamp('sqrt');
    this.lt.build(true);
    this.lt.setRamp('linear');
    this.lt.build(true);
  });

  it('allows for the conversion of a scalart to an rgba color value', function () {
    let tablevalue = this.lt.getColor(2);
    tablevalue = this.lt.getColor(-1);
  });
    
  it('allows for setting the hue, saturation, value, and alpha ranges, along with the table and input ranges', function () {
    this.lt.setHueRange(0,1);
    this.lt.setSaturationRange(0,1);
    this.lt.setValueRange(0,1);
    this.lt.setAlphaRange(0,1);
    this.lt.setTableRange(64, 128);
    this.lt.setRange(64, 128);
  });
});
