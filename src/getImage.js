/**
 * This module is responsible for returning the currently displayed image for an element
 */

var cornerstone = (function ($, cornerstone) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
    }

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

    return cornerstone;
}($, cornerstone));