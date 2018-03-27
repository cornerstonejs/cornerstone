/**
 * @return {number} Original or shifted value
 */
export default function (index, pixelData, shift) {
  if (shift !== undefined) {
    return (pixelData[index] << shift >> shift);
  } else {
    return pixelData[index];
  }
}
