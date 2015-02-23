/**
 * This module contains a function to make an image is invalid
 */
var cornerstone = (function (cornerstone) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
    }

    /**
     * Sets the invalid flag on the enabled element and fire an event
     * @param element
     */
    function invalidate(element) {
        var enabledElement = cornerstone.getEnabledElement(element);
        enabledElement.invalid = true;
        var eventData = {
            element: element
        };
        $(enabledElement.element).trigger("CornerstoneInvalidated", eventData);
    }

    // module exports
    cornerstone.invalidate = invalidate;

    return cornerstone;
}(cornerstone));