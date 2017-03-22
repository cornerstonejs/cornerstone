/**
 * This module is responsible for returning the currently displayed image for an element
 */

(function (cornerstone) {

    "use strict";

    /**
     * returns the currently displayed image for an element or undefined if no image has
     * been displayed yet
     *
     * @param element
     */
    function getImage(element) {
        var enabledElement = cornerstone.getEnabledElement(element);
        return enabledElement.image;
    }

    // Module exports
    cornerstone.getImage = getImage;
}(cornerstone));
