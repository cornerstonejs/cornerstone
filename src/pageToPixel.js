/**
 * This module contains a helper function to covert page coordinates to pixel coordinates
 */
var cornerstone = (function (cornerstone) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
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
        var ee = cornerstone.getEnabledElement(element);

        if(ee.image === undefined) {
            throw "image has not been loaded yet";
        }

        // TODO: replace this with a transformation matrix

        // convert the pageX and pageY to the canvas client coordinates
        var rect = element.getBoundingClientRect();
        var clientX = pageX - rect.left - window.pageXOffset;
        var clientY = pageY - rect.top - window.pageYOffset;

        // translate the client relative to the middle of the canvas
        var middleX = clientX - rect.width / 2.0;
        var middleY = clientY - rect.height / 2.0;

        // scale to image coordinates middleX/middleY
        var viewport = ee.viewport;

        // apply the scale
        var widthScale = ee.viewport.scale;
        var heightScale = ee.viewport.scale;
        if(ee.image.rowPixelSpacing < ee.image.columnPixelSpacing) {
            widthScale = widthScale * (ee.image.columnPixelSpacing / ee.image.rowPixelSpacing);
        }
        else if(ee.image.columnPixelSpacing < ee.image.rowPixelSpacing) {
            heightScale = heightScale * (ee.image.rowPixelSpacing / ee.image.columnPixelSpacing);
        }

        var scaledMiddleX = middleX / widthScale;
        var scaledMiddleY = middleY / heightScale;

        // apply pan offset
        var imageX = scaledMiddleX - viewport.translation.x;
        var imageY = scaledMiddleY - viewport.translation.y;
        
        //Apply Flips        
        if(viewport.hflip) {
			imageX*=-1;
        }	
        
        if(viewport.vflip) {
			imageY*=-1;
        } 
        
		//Apply rotations
		if(viewport.rotation!==0) {
			var angle = viewport.rotation * Math.PI/180;		
	
			var cosA = Math.cos(angle);
			var sinA = Math.sin(angle);
	
			var newX = imageX * cosA - imageY * sinA;
			var newY = imageX * sinA + imageY * cosA;
				
			if(viewport.rotation===90 || viewport.rotation===270 || viewport.rotation===-90 || viewport.rotation===-270) {
				newX*= -1;
				newY*= -1;
			}  
	
			imageX = newX;
			imageY = newY;
		}    

        // translate to image top left
        imageX += ee.image.columns / 2;
        imageY += ee.image.rows / 2;

        return {
            x: imageX,
            y: imageY
        };
    }

    // module/private exports
    cornerstone.pageToPixel = pageToPixel;

    return cornerstone;
}(cornerstone));
