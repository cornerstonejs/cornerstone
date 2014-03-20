var cornerstone = (function (cs, csc) {

    if(cs === undefined) {
        cs = {};
    }

    function fitToWindow(e)
    {
        var ee = cs.getEnabledElement(e);
        var verticalScale = ee.canvas.height / ee.image.rows;
        var horizontalScale = ee.canvas.width / ee.image.columns;
        if(verticalScale > horizontalScale) {
            ee.viewport.scale = verticalScale;
        }
        else {
            ee.viewport.scale = horizontalScale;
        }
        ee.viewport.centerX = 0;
        ee.viewport.centerY = 0;
        cs.updateImage(e);
    };

    cs.fitToWindow = fitToWindow;

    return cs;
}(cornerstone, cornerstoneCore));