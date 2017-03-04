/**
 * This module contains a function to make an image is invalid
 */
(function (cornerstone) {

    "use strict";

    /**
     * Sets the invalid flag on the enabled element and fire an event
     * @param element
     */
    function invalidate(element) {
        var enabledElement = cornerstone.getEnabledElement(element);
        enabledElement.invalid = true;
        enabledElement.needsRedraw = true;
        var eventData = {
            element: element
        };
        var event = new CustomEvent("CornerstoneInvalidated", {detail: eventData});
        enabledElement.element.dispatchEvent(event);
    }

    // module exports
    cornerstone.invalidate = invalidate;
}(cornerstone));
