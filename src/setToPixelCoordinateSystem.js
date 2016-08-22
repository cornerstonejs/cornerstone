/**
 * This module contains a function that will set the canvas context to the pixel coordinates system
 * making it easy to draw geometry on the image
 */

(function (cornerstone) {

    "use strict";

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

        var transform = cornerstone.internal.calculateTransform(enabledElement, scale);
        context.setTransform(transform.m[0],transform.m[1],transform.m[2],transform.m[3],transform.m[4],transform.m[5]);
    }

    // Module exports
    cornerstone.setToPixelCoordinateSystem = setToPixelCoordinateSystem;
}(cornerstone));