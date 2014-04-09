var cornerstone = (function (cornerstone) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
    }

    function fitToWindow(e)
    {
        var ee = cornerstone.getEnabledElement(e);
        var verticalScale = ee.canvas.height / ee.image.rows;
        var horizontalScale= ee.canvas.width / ee.image.columns;
        if(horizontalScale < verticalScale) {
            ee.viewport.scale = horizontalScale;
        }
        else {
            ee.viewport.scale = verticalScale;
        }
        ee.viewport.centerX = 0;
        ee.viewport.centerY = 0;
        cornerstone.updateImage(e);
    }

    cornerstone.fitToWindow = fitToWindow;

    return cornerstone;
}(cornerstone));