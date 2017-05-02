import calculateTransform from './calculateTransform.js';

export default function (enabledElement) {
    // For now we will calculate it every time it is requested.  In the future, we may want to cache
    // It in the enabled element to speed things up
  return calculateTransform(enabledElement);
}
