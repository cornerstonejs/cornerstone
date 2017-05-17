import now from './now';

/**
 * Converts stored pixel values to display pixel values using a LUT
 *
 * @param image
 * @param lut
 * @param canvasImageDataData
 */
export default function (image, lut, canvasImageDataData) {

  let start = now();
  const pixelData = image.getPixelData();

  image.stats.lastGetPixelDataTime = now() - start;

  const minPixelValue = image.minPixelValue;
  let canvasImageDataIndex = 0;
  let storedPixelDataIndex = 0;
  const numPixels = pixelData.length;

    // NOTE: As of Nov 2014, most javascript engines have lower performance when indexing negative indexes.
    // We have a special code path for this case that improves performance.  Thanks to @jpambrun for this enhancement
  start = now();
  if (minPixelValue < 0) {
    while (storedPixelDataIndex < numPixels) {
      canvasImageDataData[canvasImageDataIndex++] = lut[pixelData[storedPixelDataIndex++] + (-minPixelValue)]; // Red
      canvasImageDataData[canvasImageDataIndex++] = lut[pixelData[storedPixelDataIndex++] + (-minPixelValue)]; // Green
      canvasImageDataData[canvasImageDataIndex] = lut[pixelData[storedPixelDataIndex] + (-minPixelValue)]; // Blue
      storedPixelDataIndex += 2;
      canvasImageDataIndex += 2;
    }
  } else {
    while (storedPixelDataIndex < numPixels) {
      canvasImageDataData[canvasImageDataIndex++] = lut[pixelData[storedPixelDataIndex++]]; // Red
      canvasImageDataData[canvasImageDataIndex++] = lut[pixelData[storedPixelDataIndex++]]; // Green
      canvasImageDataData[canvasImageDataIndex] = lut[pixelData[storedPixelDataIndex]]; // Blue
      storedPixelDataIndex += 2;
      canvasImageDataIndex += 2;
    }
  }
  image.stats.laststoredPixelDataToCanvasImageDataTime = now() - start;
}
