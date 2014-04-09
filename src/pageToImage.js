var cornerstone = (function (cornerstone) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
    }

    // converts pageX and pageY coordinates in an image enabled element
    // to image coordinates
    function pageToImage(element, pageX, pageY) {
        var ee = cornerstone.getEnabledElement(element);

        if(ee.image === undefined) {
            return {
                x:0,
                y:0};
        }
        // TODO: replace this with a transformation matrix

        // convert the pageX and pageY to the canvas client coordinates
        var rect = element.getBoundingClientRect();
        var clientX = pageX - rect.left - window.scrollX;
        var clientY = pageY - rect.top - window.scrollY;

        // translate the client relative to the middle of the canvas
        var middleX = clientX - rect.width / 2.0;
        var middleY = clientY - rect.height / 2.0;

        // scale to image coordinates middleX/middleY
        var viewport = ee.viewport;
        var scaledMiddleX = middleX / viewport.scale;
        var scaledMiddleY = middleY / viewport.scale;

        // apply pan offset
        var imageX = scaledMiddleX - viewport.centerX;
        var imageY = scaledMiddleY - viewport.centerY;

        // translate to image top left
        imageX += ee.image.columns / 2;
        imageY += ee.image.rows / 2;

        return {
            x: imageX,
            y: imageY
        };
    }

    // module/private exports
    cornerstone.pageToImage=pageToImage;

    return cornerstone;
}(cornerstone));