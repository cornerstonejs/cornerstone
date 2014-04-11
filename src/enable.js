/**
 * This module is responsible for enabling an element to display images with cornerstone
 */
var cornerstone = (function (cornerstone) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
    }

    function enable(element, imageId, viewportOptions) {
        var canvas = document.createElement('canvas');

        // Set the size of canvas and take retina into account
        var retina = window.devicePixelRatio > 1;
        if(retina) {
            canvas.width = element.clientWidth * window.devicePixelRatio;
            canvas.height = element.clientHeight * window.devicePixelRatio;
            canvas.style.width = element.clientWidth + "px";
            canvas.style.height = element.clientHeight + "px";
        }
        else
        {
            canvas.width = element.clientWidth;
            canvas.height = element.clientHeight;
            canvas.style.width = element.clientWidth + "px";
            canvas.style.height = element.clientHeight + "px";
        }

        element.appendChild(canvas);

        var el = {
            element: element,
            canvas: canvas,
            imageId: "",
            imageIdHistory: [],
            data : {}
        };
        cornerstone.addEnabledElement(el);

        cornerstone.showImage(element, imageId, viewportOptions);
    }


    // module/private exports
    cornerstone.enable = enable;

    return cornerstone;
}(cornerstone));