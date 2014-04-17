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
        context.translate(enabledElement.canvas.width/2, enabledElement.canvas.height / 2);

        // apply the scale
        var widthScale = enabledElement.viewport.scale;
        var heightScale = enabledElement.viewport.scale;
        if(enabledElement.image.rowPixelSpacing < enabledElement.image.columnPixelSpacing) {
            widthScale = widthScale * (enabledElement.image.columnPixelSpacing / enabledElement.image.rowPixelSpacing);
        }
        else if(enabledElement.image.columnPixelSpacing < enabledElement.image.rowPixelSpacing) {
            heightScale = heightScale * (enabledElement.image.rowPixelSpacing / enabledElement.image.columnPixelSpacing);
        }
        context.scale(widthScale, heightScale);

        // apply the pan offset
        context.translate(enabledElement.viewport.translation.x, enabledElement.viewport.translation.y);

        if(scale === undefined) {
            scale = 1.0;
        } else {
            // apply the font scale
            context.scale(scale, scale);
        }

        // translate the origin back to the corner of the image so the event handlers can draw in image coordinate system
        context.translate(-enabledElement.image.width / 2 / scale, -enabledElement.image.height/ 2 / scale);
    }

    // Module exports
    cornerstone.setToPixelCoordinateSystem = setToPixelCoordinateSystem;

    return cornerstone;
}(cornerstone));