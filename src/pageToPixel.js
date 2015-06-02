/**
 * This module contains a helper function to covert page coordinates to pixel coordinates
 */
(function (cornerstone) {

    "use strict";

    /**
     * Converts a point in the page coordinate system to the pixel coordinate
     * system
     * @param element
     * @param pageX
     * @param pageY
     * @returns {{x: number, y: number}}
     */
    function pageToPixel(element, pageX, pageY) {
        var enabledElement = cornerstone.getEnabledElement(element);

        if(enabledElement.image === undefined) {
            throw "image has not been loaded yet";
        }

        var image = enabledElement.image;

        // convert the pageX and pageY to the canvas client coordinates
        var rect = element.getBoundingClientRect();
        var clientX = pageX - rect.left - window.pageXOffset;
        var clientY = pageY - rect.top - window.pageYOffset;

        var pt = {x: clientX, y: clientY};
        var transform = cornerstone.internal.getTransform(enabledElement);
        transform.invert();
        return transform.transformPoint(pt.x, pt.y);
    }

    // module/private exports
    cornerstone.pageToPixel = pageToPixel;

}(cornerstone));
