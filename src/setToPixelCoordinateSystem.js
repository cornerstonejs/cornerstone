/**
 * This module contains a function that will set the canvas context to the pixel coordinates system
 * making it easy to draw geometry on the image
 */

var cornerstone = (function (cornerstone) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
    }

    /**
     * Sets the canvas context transformation matrix to the pixel coordinate system.  This allows
     * geometry to be driven using the canvas context using coordinates in the pixel coordinate system
     * @param ee
     * @param context
     * @param scale optional scaler to apply
     */
    function setToPixelCoordinateSystem(enabledElement, context, scale)
    {
        if(enabledElement === undefined) {
            throw "setToPixelCoordinateSystem: parameter enabledElement must not be undefined";
        }
        if(context === undefined) {
            throw "setToPixelCoordinateSystem: parameter context must not be undefined";
        }

        // reset the transformation matrix
        context.setTransform(1, 0, 0, 1, 0, 0);
        // move origin to center of canvas
        context.translate(enabledElement.canvas.width / 2, enabledElement.canvas.height / 2);

        var image = enabledElement.image;
        var viewport = enabledElement.viewport;

        // apply the scale
        var widthScale = viewport.scale;
        var heightScale = viewport.scale;

        if(viewport.rotation === 90 || viewport.rotation === 270 || viewport.rotation === -90 || viewport.rotation === -270) {
            if(image.rowPixelSpacing < image.columnPixelSpacing) {
                widthScale = heightScale * (image.rowPixelSpacing / image.columnPixelSpacing);
            }
            else if(image.columnPixelSpacing < image.rowPixelSpacing) {
                heightScale = widthScale * (image.columnPixelSpacing / image.rowPixelSpacing);
            }
        } else {
            if(image.rowPixelSpacing < image.columnPixelSpacing) {
                widthScale = widthScale * (image.columnPixelSpacing / image.rowPixelSpacing);
            }
            else if(image.columnPixelSpacing < image.rowPixelSpacing) {
                heightScale = heightScale * (image.rowPixelSpacing / image.columnPixelSpacing);
            }
        }

        context.scale(widthScale, heightScale);

        // apply the pan offset
        context.translate(viewport.translation.x, viewport.translation.y);

        if(scale === undefined) {
            scale = 1.0;
        } else {
            // apply the font scale
            context.scale(scale, scale);
        }
        
        //Apply if rotation required        
        var angle = viewport.rotation;

		if (angle !== 0) {
			context.rotate(angle * Math.PI / 180);
		}

		//Apply Flip if required
		if (viewport.hflip) {
			context.translate(enabledElement.offsetWidth,0);
			context.scale(-1, 1);
		}

		if (viewport.vflip) {
			context.translate(0, enabledElement.offsetHeight);
			context.scale(1, -1);
		}
        
        // translate the origin back to the corner of the image so the event handlers can draw in image coordinate system
        context.translate(-image.width / 2 / scale, -image.height / 2 / scale);
    }

    // Module exports
    cornerstone.setToPixelCoordinateSystem = setToPixelCoordinateSystem;

    return cornerstone;
}(cornerstone));
