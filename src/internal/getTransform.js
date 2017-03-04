import { calculateTransform } from './calculateTransform.js';

export function getTransform(enabledElement)
{
    // For now we will calculate it every time it is requested.  In the future, we may want to cache
    // it in the enabled element to speed things up
    var transform = calculateTransform(enabledElement);
    return transform;
}
