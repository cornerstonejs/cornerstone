/**
 * This module is responsible for drawing an image to an enabled elements canvas element
 */


/**
 * Internal API function to draw an image to a given enabled element
 * @param enabledElement
 * @param invalidated - true if pixel data has been invalidated and cached rendering should not be used
 */
export function drawImage(enabledElement, invalidated) {
    enabledElement.needsRedraw = true;
    if (invalidated){
        enabledElement.invalid = true;
    }

}
