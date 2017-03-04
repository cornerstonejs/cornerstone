/**
 * This module returns a subset of the stored pixels of an image
 */

import { getEnabledElement } from './enabledElements.js';
import { getStoredPixels } from './getStoredPixels.js';
import { getModalityLUT } from './internal/modalityLUT.js';

/**
 * Returns array of pixels with modality LUT transformation applied
 */
export function getPixels(element, x, y, width, height) {

    var storedPixels = getStoredPixels(element, x, y, width, height);
    var ee = getEnabledElement(element);

    var mlutfn = getModalityLUT(ee.image.slope, ee.image.intercept, ee.viewport.modalityLUT);

    var modalityPixels = storedPixels.map(mlutfn);

    return modalityPixels;
}
