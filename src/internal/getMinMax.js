/**
 * @return {Object} with min and max value from passed in data
 */
export default function (pixelData) {
  let min = pixelData[0];
  let max = pixelData[0];
  let pixel;
  const numPixels = pixelData.length;

  for (let index = 0; index < numPixels; index++) {
    pixel = pixelData[index];
    min = Math.min(min, pixel);
    max = Math.max(max, pixel);
  }

  return {
    min,
    max
  };
}
