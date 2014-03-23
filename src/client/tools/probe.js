var cornerstoneTools = (function ($, cornerstone, csc, cornerstoneTools) {

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    // TODO: make a generic data storage mechanism for elements that
    //       gets cleaned up when the element is destroyed
    var dataList  = {};

    function onMouseDown(e) {
        var element = e.currentTarget;
        var data = dataList[element];
        if(e.which == data.whichMouseButton) {
            var coords = cornerstone.pageToImage(element, e.pageX, e.pageY);
            data.x = coords.x;
            data.y = coords.y;
            data.visible = true;
            cornerstone.updateImage(element);

            $(document).mousemove(function(e) {
                var coords = cornerstone.pageToImage(element, e.pageX, e.pageY);
                data.x = coords.x;
                data.y = coords.y;
                cornerstone.updateImage(element);
            });

            $(document).mouseup(function(e) {
                data.visible = false;
                cornerstone.updateImage(element);
                $(document).unbind('mousemove');
                $(document).unbind('mouseup');
            });
        }
    };

    function onImageRendered(e)
    {
        var data = dataList[e.detail.element];

        if(data.visible == false)
        {
            return;
        }

        csc.setToPixelCoordinateSystem(e.detail.enabledElement, e.detail.canvasContext);

        var context = e.detail.canvasContext;
        context.beginPath();
        //context.fillStyle = "white";
        //context.lineWidth = .1;
        //context.rect(x,y,1,1);
        context.stroke();


        var fontParameters = csc.setToFontCoordinateSystem(e.detail.enabledElement, e.detail.canvasContext, 15);
        context.font = "" + fontParameters.fontSize + "px Arial";

        var x =Math.round(data.x);
        var y = Math.round(data.y);
        var storedPixels = cornerstone.getStoredPixels(e.detail.element, x, y, 1, 1);
        var sp = storedPixels[0];
        var mo = sp * e.detail.image.slope + e.detail.image.intercept;

        var textX = (x + 3)/ fontParameters.fontScale;
        var textY = (y- 3) / fontParameters.fontScale - fontParameters.lineHeight;

        context.fillStyle = "white";
        context.fillText("" + x + "," + y, textX, textY);
        context.fillText("SP: " + sp + " MO: " + mo, textX, textY + fontParameters.lineHeight);
    };

    function enableProbe(element, whichMouseButton)
    {
        element.addEventListener("CornerstoneImageRendered", onImageRendered, false);

        var eventData =
        {
            whichMouseButton: whichMouseButton,
            visible : false,
            x : 0,
            y : 0
        };

        dataList[element] = eventData;

        $(element).mousedown(onMouseDown);
    };

    function disableProbe(element)
    {
        element.removeEventListener("CornerstoneImageRendered", onImageRendered);
        $(element).unbind('mousedown', onMouseDown);
        dataList[element] = undefined;
    };

    // module/private exports
    cornerstoneTools.enableProbe = enableProbe;
    cornerstoneTools.disableProbe = disableProbe;

    return cornerstoneTools;
}($, cornerstone, cornerstoneCore, cornerstoneTools));