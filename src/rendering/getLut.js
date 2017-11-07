import lutMatches from './lutMatches.js';
import generateLut from '../internal/generateLut.js';

export default function (image, viewport, invalidated) {
  // If we have a cached lut and it has the right values, return it immediately
  if (image.cachedLut !== undefined &&
    image.cachedLut.windowCenter === viewport.voi.windowCenter &&
    image.cachedLut.windowWidth === viewport.voi.windowWidth &&
    lutMatches(image.cachedLut.modalityLUT, viewport.modalityLUT) &&
    lutMatches(image.cachedLut.voiLUT, viewport.voiLUT) &&
    image.cachedLut.invert === viewport.invert &&
    invalidated !== true) {
    return image.cachedLut.lutArray;
  }

  // Lut is invalid or not present, regenerate it and cache it
  generateLut(image, viewport.voi.windowWidth, viewport.voi.windowCenter, viewport.invert, viewport.modalityLUT, viewport.voiLUT);

  image.cachedLut.windowWidth = viewport.voi.windowWidth;
  image.cachedLut.windowCenter = viewport.voi.windowCenter;
  image.cachedLut.invert = viewport.invert;
  image.cachedLut.voiLUT = viewport.voiLUT;
  image.cachedLut.modalityLUT = viewport.modalityLUT;

  return image.cachedLut.lutArray;
}
