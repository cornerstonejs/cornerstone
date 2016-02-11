/**
 * This module is responsible for enabling an element to display images with cornerstone
 */
(function (cornerstone) {

    "use strict";

    var idCpt = 0;

    function enable(element) {
        if(element === undefined) {
            throw "enable: parameter element cannot be undefined";
        }

        var canvas = document.createElement('canvas');
        element.appendChild(canvas);

        var el = {
            id: idCpt++,
            element: element,
            canvas: canvas,
            image : undefined, // will be set once image is loaded
            invalid: false, // true if image needs to be drawn, false if not
            data : {}
        };
        cornerstone.addEnabledElement(el);

        cornerstone.resize(element, true);

        return element;
    }

    // module/private exports
    cornerstone.enable = enable;
}(cornerstone));