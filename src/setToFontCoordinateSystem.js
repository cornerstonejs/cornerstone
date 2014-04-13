/**
 * This module sets the transformation matrix for a canvas context so it displays fonts
 * smoothly even when the image is highly scaled up
 */

var cornerstone = (function (cornerstone) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
    }

    /**
     * Sets the canvas context transformation matrix so it is scaled to show text
     * more cleanly even if the image is scaled up.  See
     * https://github.com/chafey/cornerstoneTools/wiki/DrawingText
     * for more information
     *
     * @param ee
     * @param context
     * @param fontSize
     * @returns {{fontSize: number, lineHeight: number, fontScale: number}}
     */
    function setToFontCoordinateSystem(ee, context, fontSize)
    {
        // reset the transformation matrix
        context.setTransform(1, 0, 0, 1, 0, 0);
        // move origin to center of canvas
        context.translate(ee.canvas.width/2, ee.canvas.height / 2);
        // apply the scale
        var widthScale = ee.viewport.scale;
        var heightScale = ee.viewport.scale;
        if(ee.image.rowPixelSpacing < ee.image.columnPixelSpacing) {
            widthScale = widthScale * (ee.image.columnPixelSpacing / ee.image.rowPixelSpacing);
        }
        else if(ee.image.columnPixelSpacing < ee.image.rowPixelSpacing) {
            heightScale = heightScale * (ee.image.rowPixelSpacing / ee.image.columnPixelSpacing);
        }

        // apply the pan offset
        context.translate(ee.viewport.centerX, ee.viewport.centerY);

        var fontScale = 0.1;
        // apply the font scale
        context.scale(fontScale, fontScale);
        // translate the origin back to the corner of the image so the event handlers can draw in image coordinate system
        context.translate(-ee.image.columns /2 / fontScale, -ee.image.rows/2 / fontScale);

        // return the font size to use
        var scaledFontSize = fontSize / ee.viewport.scale / fontScale;
        // TODO: actually calculate this?
        var lineHeight  = fontSize / ee.viewport.scale / fontScale;

        return {
            fontSize :scaledFontSize,
            lineHeight:lineHeight,
            fontScale: fontScale
        };

    }

    // Module exports
    cornerstone.setToFontCoordinateSystem = setToFontCoordinateSystem;

    return cornerstone;
}(cornerstone));