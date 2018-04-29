import { assert } from 'chai'; // eslint-disable-line import/extensions

import { getColormap, getColormapsList } from '../../src/colors/colormap.js';

describe('Get Colormaps', function () {

  it('should return all colormap objects', function () {

    const colormapsData = [
      {
        id: 'autumn',
        name: 'Autumn'
      },
      {
        id: 'blues',
        name: 'Blues'
      },
      {
        id: 'bone',
        name: 'Bone'
      },
      {
        id: 'cool',
        name: 'Cool'
      },
      {
        id: 'coolwarm',
        name: 'CoolWarm'
      },
      {
        id: 'copper',
        name: 'Copper'
      },
      {
        id: 'gray',
        name: 'Gray'
      },
      {
        id: 'hot',
        name: 'Hot'
      },
      {
        id: 'hotIron',
        name: 'Hot Iron'
      },
      {
        id: 'hotMetalBlue',
        name: 'Hot Metal Blue'
      },
      {
        id: 'hsv',
        name: 'HSV'
      },
      {
        id: 'jet',
        name: 'Jet'
      },
      {
        id: 'pet',
        name: 'PET'
      },
      {
        id: 'pet20Step',
        name: 'PET 20 Step'
      },
      {
        id: 'spectral',
        name: 'Spectral'
      },
      {
        id: 'spring',
        name: 'Spring'
      },
      {
        id: 'summer',
        name: 'Summer'
      },
      {
        id: 'winter',
        name: 'Winter'
      },
      undefined
    ];

    // Act
    const colormaps = getColormapsList();

    // Assert
    assert.deepEqual(colormapsData[6], colormaps[6]);
    for (let i = 0; i < colormapsData.length; i++) {
      assert.deepEqual(colormapsData[i], colormaps[i]);
    }
  });

  it('should return existing colormap object', function () {
    const colormapId = 'gray';

    const colormapData = {
      name: 'Gray',
      numColors: 256,
      gamma: 1
    };


    // Act
    const colormapObject = getColormap(colormapId);

    // Assert
    assert.typeOf(colormapObject.getId, 'function');
    assert.typeOf(colormapObject.getColorSchemeName, 'function');
    assert.typeOf(colormapObject.setColorSchemeName, 'function');
    assert.typeOf(colormapObject.getNumberOfColors, 'function');
    assert.typeOf(colormapObject.setNumberOfColors, 'function');
    assert.typeOf(colormapObject.getColor, 'function');
    assert.typeOf(colormapObject.getColorRepeating, 'function');
    assert.typeOf(colormapObject.setColor, 'function');
    assert.typeOf(colormapObject.addColor, 'function');
    assert.typeOf(colormapObject.insertColor, 'function');
    assert.typeOf(colormapObject.removeColor, 'function');
    assert.typeOf(colormapObject.clearColors, 'function');
    assert.typeOf(colormapObject.buildLookupTable, 'function');
    assert.typeOf(colormapObject.createLookupTable, 'function');
    assert.typeOf(colormapObject.isValidIndex, 'function');

    assert.equal(colormapId, colormapObject.getId());
    assert.equal(colormapData.numColors, colormapObject.getNumberOfColors());
    assert.equal(colormapData.name, colormapObject.getColorSchemeName());

  });

  it('should return defined colormap object', function () {

    const newColormapId = 'Fake Copper';

    const fakeColor = {
      name: 'fakeCopper',
      numColors: 250,
      gamma: 1,
      segmentedData: {
        red: [[0, 0, 0], [0.809524, 1, 1], [1, 1, 1]],
        green: [[0, 0, 0], [1, 0.7812, 0.7812]],
        blue: [[0, 0, 0], [1, 0.4975, 0.4975]]
      }
    };

    // Act
    const colormapObject = getColormap(newColormapId, fakeColor);

    // Assert
    assert.typeOf(colormapObject.getId, 'function');
    assert.typeOf(colormapObject.getColorSchemeName, 'function');
    assert.typeOf(colormapObject.setColorSchemeName, 'function');
    assert.typeOf(colormapObject.getNumberOfColors, 'function');
    assert.typeOf(colormapObject.setNumberOfColors, 'function');
    assert.typeOf(colormapObject.getColor, 'function');
    assert.typeOf(colormapObject.getColorRepeating, 'function');
    assert.typeOf(colormapObject.setColor, 'function');
    assert.typeOf(colormapObject.addColor, 'function');
    assert.typeOf(colormapObject.insertColor, 'function');
    assert.typeOf(colormapObject.removeColor, 'function');
    assert.typeOf(colormapObject.clearColors, 'function');
    assert.typeOf(colormapObject.buildLookupTable, 'function');
    assert.typeOf(colormapObject.createLookupTable, 'function');
    assert.typeOf(colormapObject.isValidIndex, 'function');

    assert.equal(newColormapId, colormapObject.getId());
    assert.equal(fakeColor.numColors, colormapObject.getNumberOfColors());
    assert.equal(fakeColor.name, colormapObject.getColorSchemeName());

  });
});
