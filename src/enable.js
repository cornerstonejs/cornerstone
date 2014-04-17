/**
 * This module is responsible for enabling an element to display images with cornerstone
 */
var cornerstone = (function (cornerstone) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
    }

    function enable(element) {
        if(element === undefined) {
            throw "enable: parameter element cannot be undefined";
        }

        var canvas = document.createElement('canvas');
        element.appendChild(canvas);

        var el = {
            element: element,
            canvas: canvas,
            image : undefined, // will be set once image is loaded
            data : {}
        };
        cornerstone.addEnabledElement(el);

        cornerstone.resize(element, true);

        return element;
    }

    // module/private exports
    cornerstone.enable = enable;

    return cornerstone;
}(cornerstone));