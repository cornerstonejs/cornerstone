/**
 * This module contains a helper function to covert page coordinates to pixel coordinates
 */
var cornerstone = (function (cornerstone) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
    }

    function rotate(rotation, pt) {
        while(rotation < 0) {
            rotation += 360;
        }
        //console.log('rotation of ' + rotation);
        var angle = rotation * Math.PI/180;

        var cosA = Math.cos(angle);
        var sinA = Math.sin(angle);

        var newX = pt.x * cosA - pt.y * sinA;
        var newY = pt.x * sinA + pt.y * cosA;

        var newPt = {
            x: newX,
            y: newY
        };
        return newPt;
    }

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

        // TODO: replace this with a transformation matrix
        var image = enabledElement.image;
        var viewport = enabledElement.viewport;

        // convert the pageX and pageY to the canvas client coordinates
        var rect = element.getBoundingClientRect();
        var clientX = pageX - rect.left - window.pageXOffset;
        var clientY = pageY - rect.top - window.pageYOffset;

        var pt = {x: clientX, y: clientY};

        // translate the client relative to the middle of the canvas
        pt.x -= rect.width / 2.0;
        pt.y -= rect.height / 2.0;
        //console.log('centered');
        //console.log(pt);

        pt = rotate(-viewport.rotation, pt);
        //console.log('rot1');
        //console.log(pt);

        // apply the scale
        var widthScale = viewport.scale;
        var heightScale = viewport.scale;

        if(enabledElement.image.rowPixelSpacing < enabledElement.image.columnPixelSpacing) {
            widthScale = widthScale * (enabledElement.image.columnPixelSpacing / enabledElement.image.rowPixelSpacing);
        }
        else if(enabledElement.image.columnPixelSpacing < enabledElement.image.rowPixelSpacing) {
            heightScale = heightScale * (enabledElement.image.rowPixelSpacing / enabledElement.image.columnPixelSpacing);
        }

        // scale to image coordinates middleX/middleY
        pt.x /= widthScale;
        pt.y /= heightScale;

        pt = rotate(viewport.rotation, pt);

        // apply pan offset
        pt.x -= viewport.translation.x;
        pt.y -= viewport.translation.y;

        //Apply Flips
        if (viewport.hflip) {
			pt.x *= -1;
        }

        if (viewport.vflip) {
			pt.y *= -1;
        }
        
		//Apply rotations
        pt = rotate(-viewport.rotation, pt);

        // translate to image top left

        pt.x += image.columns / 2;
        pt.y += image.rows / 2;
        return pt;
    }

    // module/private exports
    cornerstone.pageToPixel = pageToPixel;

    return cornerstone;
}(cornerstone));
