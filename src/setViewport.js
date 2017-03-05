/**
 * This module contains functions to deal with getting and setting the viewport for an enabled element
 */

import { getEnabledElement } from './enabledElements.js';
import { updateImage } from './updateImage.js';

/**
 * Sets the viewport for an element and corrects invalid values
 *
 * @param element - DOM element of the enabled element
 * @param viewport - Object containing the viewport properties
 * @returns {*}
 */
export function setViewport(element, viewport) {

    var enabledElement = getEnabledElement(element);

    enabledElement.viewport.scale = viewport.scale;
    enabledElement.viewport.translation.x = viewport.translation.x;
    enabledElement.viewport.translation.y = viewport.translation.y;
    enabledElement.viewport.voi.windowWidth = viewport.voi.windowWidth;
    enabledElement.viewport.voi.windowCenter = viewport.voi.windowCenter;
    enabledElement.viewport.invert = viewport.invert;
    enabledElement.viewport.pixelReplication = viewport.pixelReplication;
    enabledElement.viewport.rotation = viewport.rotation;
    enabledElement.viewport.hflip = viewport.hflip;
    enabledElement.viewport.vflip = viewport.vflip;
    enabledElement.viewport.modalityLUT = viewport.modalityLUT;
    enabledElement.viewport.voiLUT = viewport.voiLUT;

    // prevent window width from being too small (note that values close to zero are valid and can occur with
    // PET images in particular)
    if(enabledElement.viewport.voi.windowWidth < 0.000001) {
        enabledElement.viewport.voi.windowWidth = 0.000001;
    }
    // prevent scale from getting too small
    if(enabledElement.viewport.scale < 0.0001) {
        enabledElement.viewport.scale = 0.25;
    }

    if(enabledElement.viewport.rotation===360 || enabledElement.viewport.rotation===-360) {
        enabledElement.viewport.rotation = 0;
    }

    // Force the image to be updated since the viewport has been modified
    updateImage(element);
}
