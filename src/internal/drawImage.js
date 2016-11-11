/**
 * This module is responsible for drawing an image to an enabled elements canvas element
 */

(function ($, cornerstone) {

    "use strict";

    /**
     * Internal API function to draw an image to a given enabled element
     * @param enabledElement
     * @param invalidated - true if pixel data has been invalidated and cached rendering should not be used
     */
    function drawImage(enabledElement, invalidated) {
        enabledElement.needsRedraw = true;
        if (invalidated){
            enabledElement.invalid = true;
        }

    }

    // Module exports
    cornerstone.internal.drawImage = drawImage;
    cornerstone.drawImage = drawImage;

}($, cornerstone));