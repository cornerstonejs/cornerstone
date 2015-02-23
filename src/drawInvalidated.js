/**
 * This module is responsible for drawing invalidated enabled elements
 */

var cornerstone = (function ($, cornerstone) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
    }

    /**
     * Draws all invalidated enabled elements and clears the invalid flag after drawing it
     */
    function drawInvalidated()
    {
        var enabledElements = cornerstone.getEnabledElements();
        for(var i=0;i < enabledElements.length; i++) {
            var ee = enabledElements[i];
            if(ee.invalid === true) {
                cornerstone.drawImage(ee);
            }
        }
    }

    // Module exports
    cornerstone.drawInvalidated = drawInvalidated;

    return cornerstone;
}($, cornerstone));