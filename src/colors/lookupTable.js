// This code was created based on vtkLookupTable
// http://www.vtk.org/doc/release/5.0/html/a01697.html
// https://github.com/Kitware/VTK/blob/master/Common/Core/vtkLookupTable.cxx
const BELOW_RANGE_COLOR_INDEX = 0;
const ABOVE_RANGE_COLOR_INDEX = 1;
const NAN_COLOR_INDEX = 2;

/**
 * Converts an HSV  (Hue, Saturation, Value) color to RGB (Red, Green, Blue) color value
 * @param {Number} hue A number representing the hue color value
 * @param {any} sat A number representing the saturation color value
 * @param {any} val A number representing the value color value
 * @returns {Numberp[]} An RGB color array
 */
function HSVToRGB (hue, sat, val) {
  if (hue > 1) {
    throw new Error('HSVToRGB expects hue < 1');
  }

  const rgb = [];

  if (sat === 0) {
    rgb[0] = val;
    rgb[1] = val;
    rgb[2] = val;

    return rgb;
  }

  const hueCase = Math.floor(hue * 6);
  const frac = 6 * hue - hueCase;
  const lx = val * (1 - sat);
  const ly = val * (1 - sat * frac);
  const lz = val * (1 - sat * (1 - frac));

  switch (hueCase) {

  /* 0<hue<1/6 */
  case 0:
  case 6:
    rgb[0] = val;
    rgb[1] = lz;
    rgb[2] = lx;
    break;

    /* 1/6<hue<2/6 */
  case 1:
    rgb[0] = ly;
    rgb[1] = val;
    rgb[2] = lx;
    break;

    /* 2/6<hue<3/6 */
  case 2:
    rgb[0] = lx;
    rgb[1] = val;
    rgb[2] = lz;
    break;

    /* 3/6<hue/4/6 */
  case 3:
    rgb[0] = lx;
    rgb[1] = ly;
    rgb[2] = val;
    break;

    /* 4/6<hue<5/6 */
  case 4:
    rgb[0] = lz;
    rgb[1] = lx;
    rgb[2] = val;
    break;

    /* 5/6<hue<1 */
  case 5:
    rgb[0] = val;
    rgb[1] = lx;
    rgb[2] = ly;
    break;
  }

  return rgb;
}

/**
 * Maps a value to an index in the table
 * @param {Number} v A double value which table index will be returned.
 * @param {any} p An object that contains the Table "Range", the table "MaxIndex",
 * A "Shift" from first value in the table and the table "Scale" value
 * @returns The mapped index in the table
 * @memberof Colors
 */
function linearIndexLookupMain (v, p) {
  let dIndex;

  // NOTE: Added Math.floor since values were not integers? Check VTK source
  if (v < p.Range[0]) {
    dIndex = p.MaxIndex + BELOW_RANGE_COLOR_INDEX + 1.5;
  } else if (v > p.Range[1]) {
    dIndex = p.MaxIndex + ABOVE_RANGE_COLOR_INDEX + 1.5;
  } else {
    dIndex = (v + p.Shift) * p.Scale;
  }

  return Math.floor(dIndex);
}

/**
 * Maps scalar values into colors via a lookup table
 * LookupTable is an object that is used by mapper objects to map scalar values into rgba (red-green-blue-alpha transparency) color specification,
 * or rgba into scalar values. The color table can be created by direct insertion of color values, or by specifying hue, saturation, value, and alpha range and generating a table
 */
class LookupTable {

  /**
   * Creates a default linear LookupTable object with 256 colors.
   */
  constructor () {
    this.NumberOfColors = 256;
    this.Ramp = 'linear';
    this.TableRange = [0, 255];
    this.HueRange = [0, 0.66667];
    this.SaturationRange = [1, 1];
    this.ValueRange = [1, 1];
    this.AlphaRange = [1, 1];
    this.NaNColor = [128, 0, 0, 255];
    this.BelowRangeColor = [0, 0, 0, 255];
    this.UseBelowRangeColor = true;
    this.AboveRangeColor = [255, 255, 255, 255];
    this.UseAboveRangeColor = true;
    this.InputRange = [0, 255];
    this.Table = [];
  }

  /**
   * Specify the number of values (i.e., colors) in the lookup table.
   * @param {Number} number The number of colors in he LookupTable
   * @returns {void}
   * @memberof Colors
   */
  setNumberOfTableValues (number) {
    this.NumberOfColors = number;
  }

  /**
   * Set the shape of the table ramp to either 'linear', 'scurve' or 'sqrt'
   * @param {String} ramp A string value representing the shape of the table. Allowed values are 'linear', 'scurve' or 'sqrt'
   * @returns {void}
   * @memberof Colors
   */
  setRamp (ramp) {
    this.Ramp = ramp;
  }

  /**
   * Sets the minimum/maximum scalar values for scalar mapping.
   * Scalar values less than minimum range value are clamped to minimum range value.
   * Scalar values greater than maximum range value are clamped to maximum range value.
   * @param {Number} start A double representing the minimum scaler value of the LookupTable
   * @param {any} end A double representing the maximum scaler value of the LookupTable
   * @returns {void}
   * @memberof Colors
   */
  setTableRange (start, end) {
    this.TableRange[0] = start;
    this.TableRange[1] = end;
  }

  /**
   * Set the range in hue (using automatic generation). Hue ranges between [0,1].
   * @param {Number} start A double representing the minimum hue value in a range. Min. is 0
   * @param {Number} end A double representing the maximum hue value in a range. Max. is 1
   * @returns {void}
   * @memberof Colors
   */
  setHueRange (start, end) {
    this.HueRange[0] = start;
    this.HueRange[1] = end;
  }

  /**
   * Set the range in saturation (using automatic generation). Saturation ranges between [0,1].
   * @param {Number} start A double representing the minimum Saturation value in a range. Min. is 0
   * @param {Number} end A double representing the maximum Saturation value in a range. Max. is 1
   * @returns {void}
   * @memberof Colors
   */
  setSaturationRange (start, end) {
    this.SaturationRange[0] = start;
    this.SaturationRange[1] = end;
  }

  /**
   * Set the range in value (using automatic generation). Value ranges between [0,1].
   * @param {Numeber } start A double representing the minimum value in a range. Min. is 0
   * @param {Numeber} end A double representing the maximum value in a range. Max. is 1
   * @returns {void}
   * @memberof Colors
   */
  setValueRange (start, end) {
    // Set the range in value (using automatic generation). Value ranges between [0,1].
    this.ValueRange[0] = start;
    this.ValueRange[1] = end;
  }

  /**
   * (Not Used) Sets the range of scalars which will be mapped.
   * @param {Number} start the minimum scalar value in the range 
   * @param {Number} end the maximum scalar value in the range
   * @returns {void}
   * @memberof Colors
   */
  setRange (start, end) {
    this.InputRange[0] = start;
    this.InputRange[1] = end;
  }

  /**
   * Set the range in alpha (using automatic generation). Alpha ranges from [0,1].
   * @param {Number} start A double representing the minimum alpha value
   * @param {Number} end A double representing the maximum alpha value
   * @returns {void}
   * @memberof Colors
   */
  setAlphaRange (start, end) {
    // Set the range in alpha (using automatic generation). Alpha ranges from [0,1].
    this.AlphaRange[0] = start;
    this.AlphaRange[1] = end;
  }

  /**
   * Map one value through the lookup table and return the color as an
   * RGBA array of doubles between 0 and 1.
   * @param {Number} scalar A double scalar value which will be mapped to a color in the LookupTable
   * @returns {Number[]} An RGBA array of doubles between 0 and 1
   * @memberof Colors
   */
  getColor (scalar) {

    return this.mapValue(scalar);
  }

  /**
   * Generate lookup table from hue, saturation, value, alpha min/max values. Table is built from linear ramp of each value.
   * @param {Boolean} force true to force the build of the LookupTable. Otherwie, false. This is useful if a lookup table has been defined manually
   * (using SetTableValue) and then an application decides to rebuild the lookup table using the implicit process.
   * @returns {void}
   * @memberof Colors
   */
  build (force) {
    if (this.Table.length > 1 && !force) {
      return;
    }

    // Clear the table
    this.Table = [];

    const maxIndex = this.NumberOfColors - 1;

    let hinc, sinc, vinc, ainc;

    if (maxIndex) {
      hinc = (this.HueRange[1] - this.HueRange[0]) / maxIndex;
      sinc = (this.SaturationRange[1] - this.SaturationRange[0]) / maxIndex;
      vinc = (this.ValueRange[1] - this.ValueRange[0]) / maxIndex;
      ainc = (this.AlphaRange[1] - this.AlphaRange[0]) / maxIndex;
    } else {
      hinc = sinc = vinc = ainc = 0.0;
    }

    for (let i = 0; i <= maxIndex; i++) {
      const hue = this.HueRange[0] + i * hinc;
      const sat = this.SaturationRange[0] + i * sinc;
      const val = this.ValueRange[0] + i * vinc;
      const alpha = this.AlphaRange[0] + i * ainc;

      const rgb = HSVToRGB(hue, sat, val);
      const c_rgba = [];

      switch (this.Ramp) {
      case 'scurve':
        c_rgba[0] = Math.floor(127.5 * (1.0 + Math.cos((1.0 - rgb[0]) * Math.PI)));
        c_rgba[1] = Math.floor(127.5 * (1.0 + Math.cos((1.0 - rgb[1]) * Math.PI)));
        c_rgba[2] = Math.floor(127.5 * (1.0 + Math.cos((1.0 - rgb[2]) * Math.PI)));
        c_rgba[3] = Math.floor(alpha * 255);
        break;
      case 'linear':
        c_rgba[0] = Math.floor(rgb[0] * 255 + 0.5);
        c_rgba[1] = Math.floor(rgb[1] * 255 + 0.5);
        c_rgba[2] = Math.floor(rgb[2] * 255 + 0.5);
        c_rgba[3] = Math.floor(alpha * 255 + 0.5);
        break;
      case 'sqrt':
        c_rgba[0] = Math.floor(Math.sqrt(rgb[0]) * 255 + 0.5);
        c_rgba[1] = Math.floor(Math.sqrt(rgb[1]) * 255 + 0.5);
        c_rgba[2] = Math.floor(Math.sqrt(rgb[2]) * 255 + 0.5);
        c_rgba[3] = Math.floor(Math.sqrt(alpha) * 255 + 0.5);
        break;
      default:
        throw new Error(`Invalid Ramp value (${this.Ramp})`);
      }

      this.Table.push(c_rgba);
    }

    this.buildSpecialColors();
  }

  /**
   * Ensures the out-of-range colors (Below range and Above range) are set correctly.
   */
  buildSpecialColors () {
    const numberOfColors = this.NumberOfColors;
    const belowRangeColorIndex = numberOfColors + BELOW_RANGE_COLOR_INDEX;
    const aboveRangeColorIndex = numberOfColors + ABOVE_RANGE_COLOR_INDEX;
    const nanColorIndex = numberOfColors + NAN_COLOR_INDEX;

    // Below range color
    if (this.UseBelowRangeColor || numberOfColors === 0) {
      this.Table[belowRangeColorIndex] = this.BelowRangeColor;
    } else {
      // Duplicate the first color in the table.
      this.Table[belowRangeColorIndex] = this.Table[0];
    }

    // Above range color
    if (this.UseAboveRangeColor || numberOfColors === 0) {
      this.Table[aboveRangeColorIndex] = this.AboveRangeColor;
    } else {
      // Duplicate the last color in the table.
      this.Table[aboveRangeColorIndex] = this.Table[numberOfColors - 1];
    }

    // Always use NanColor
    this.Table[nanColorIndex] = this.NaNColor;
  }

  /**
   * Similar to GetColor - Map one value through the lookup table and return the color as an
   * RGBA array of doubles between 0 and 1.
   * @param {Numeber} v A double scalar value which will be mapped to a color in the LookupTable
   * @returns {Number[]} An RGBA array of doubles between 0 and 1
   * @memberof Colors
   */
  mapValue (v) {
    const index = this.getIndex(v);

    if (index < 0) {
      return this.NaNColor;
    } else if (index === 0) {
      if (this.UseBelowRangeColor && v < this.TableRange[0]) {
        return this.BelowRangeColor;
      }
    } else if (index === this.NumberOfColors - 1) {
      if (this.UseAboveRangeColor && v > this.TableRange[1]) {
        return this.AboveRangeColor;
      }
    }

    return this.Table[index];
  }

  /**
   * Return the table index associated with a particular value.
   * @param {Number} v A double value which table index will be returned.
   * @returns {Number} The index in the LookupTable
   * @memberof Colors
   */
  getIndex (v) {
    const p = {};

    p.Range = [];
    p.MaxIndex = this.NumberOfColors - 1;

    // This was LookupShiftAndScale
    p.Shift = -this.TableRange[0];
    if (this.TableRange[1] <= this.TableRange[0]) {
      p.Scale = Number.MAX_VALUE;
    } else {
      p.Scale = p.MaxIndex / (this.TableRange[1] - this.TableRange[0]);
    }

    p.Range[0] = this.TableRange[0];
    p.Range[1] = this.TableRange[1];

    // First, check whether we have a number...
    if (isNaN(v)) {
      // For backwards compatibility
      return -1;
    }

    // Map to an index:
    let index = linearIndexLookupMain(v, p);

    // For backwards compatibility, if the index indicates an
    // Out-of-range value, truncate to index range for in-range colors.
    if (index === this.NumberOfColors + BELOW_RANGE_COLOR_INDEX) {
      index = 0;
    } else if (index === this.NumberOfColors + ABOVE_RANGE_COLOR_INDEX) {
      index = this.NumberOfColors - 1;
    }

    return index;
  }


  /**
   * Directly load color into lookup table. Use [0,1] double values for color component specification.
   * Make sure that you've either used the Build() method or used SetNumberOfTableValues() prior to using this method.
   * @param {Number} index The index in the LookupTable of where to insert the color value
   * @param {Number[]} rgba An array of [0,1] double values for an RGBA color component
   * @returns {void}
   * @memberof Colors
   */
  setTableValue (index, rgba) {
    // Check if it index, red, green, blue and alpha were passed as parameter
    if (arguments.length === 5) {
      rgba = Array.prototype.slice.call(arguments, 1);
    }

    // Check the index to make sure it is valid
    if (index < 0) {
      throw new Error(`Can't set the table value for negative index (${index})`);
    }

    if (index >= this.NumberOfColors) {
      new Error(`Index ${index} is greater than the number of colors ${this.NumberOfColors}`);
    }

    this.Table[index] = rgba;

    if ((index === 0) || (index === this.NumberOfColors - 1)) {
      // This is needed due to the way the special colors are stored in
      // The internal table. If Above/BelowRangeColors are not used and
      // The min/max colors are changed in the table with this member
      // Function, then the colors used for values outside the range may
      // Be incorrect. Calling this here ensures the out-of-range colors
      // Are set correctly.
      this.buildSpecialColors();
    }
  }
}

export default LookupTable;
