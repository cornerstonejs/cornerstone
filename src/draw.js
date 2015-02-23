/**
 * This module is responsible for immediately drawing an enabled element
 */

var cornerstone = (function ($, cornerstone) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
    }

    /**
     * Immediately draws the enabled element
     *
     * @param element
     */
    function draw(element) {
        var enabledElement = cornerstone.getEnabledElement(element);

        if(enabledElement.image === undefined) {
            throw "draw: image has not been loaded yet";
        }

        cornerstone.drawImage(enabledElement);
    }

    // Module exports
    cornerstone.draw = draw;

    return cornerstone;
}($, cornerstone));