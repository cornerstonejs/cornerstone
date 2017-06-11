import colors from './colors/index.js';

/**
 * Converts the image pixel data into a false color data
 *
 * @param {Image} image A Cornerstone Image Object
 * @param {Object} lookupTable A lookup table Object
 *
 * @returns {void}
 */
export default function (image, lookupTable) {
  if (image.color && !image.falseColor) {
    throw new Error('Color transforms are not implemented yet');
  }

  const minPixelValue = image.minPixelValue;
  let canvasImageDataIndex = 0;
  let storedPixelDataIndex = 0;
  const numPixels = image.width * image.height;
  const origPixelData = image.origPixelData || image.getPixelData();
  const storedColorPixelData = new Uint8Array(numPixels * 4);
  const localLookupTable = lookupTable;
  let sp, mapped;

  image.color = true;
  image.falseColor = true;
  image.origPixelData = origPixelData;

  if (lookupTable instanceof colors.LookupTable) {
    lookupTable.build();

    while (storedPixelDataIndex < numPixels) {
      sp = origPixelData[storedPixelDataIndex++];
      mapped = lookupTable.mapValue(sp);
      storedColorPixelData[canvasImageDataIndex++] = mapped[0];
      storedColorPixelData[canvasImageDataIndex++] = mapped[1];
      storedColorPixelData[canvasImageDataIndex++] = mapped[2];
      storedColorPixelData[canvasImageDataIndex++] = mapped[3];
    }
  } else if (minPixelValue < 0) {
    while (storedPixelDataIndex < numPixels) {
      sp = origPixelData[storedPixelDataIndex++];
      storedColorPixelData[canvasImageDataIndex++] = localLookupTable[sp + (-minPixelValue)][0]; // Red
      storedColorPixelData[canvasImageDataIndex++] = localLookupTable[sp + (-minPixelValue)][1]; // Green
      storedColorPixelData[canvasImageDataIndex++] = localLookupTable[sp + (-minPixelValue)][2]; // Blue
      storedColorPixelData[canvasImageDataIndex++] = localLookupTable[sp + (-minPixelValue)][3]; // Alpha
    }
  } else {
    while (storedPixelDataIndex < numPixels) {
      sp = origPixelData[storedPixelDataIndex++];
      storedColorPixelData[canvasImageDataIndex++] = localLookupTable[sp][0]; // Red
      storedColorPixelData[canvasImageDataIndex++] = localLookupTable[sp][1]; // Green
      storedColorPixelData[canvasImageDataIndex++] = localLookupTable[sp][2]; // Blue
      storedColorPixelData[canvasImageDataIndex++] = localLookupTable[sp][3]; // Alpha
    }
  }

  image.rgba = true;
  image.lut = undefined;
  image.slope = 1;
  image.minPixelValue = 0;
  image.maxPixelValue = 255;
  image.windowWidth = 255;
  image.windowCenter = 128;
  image.getPixelData = function () {
    return storedColorPixelData;
  };
}
