var cornerstoneTools = (function ($, cornerstone, csc, cornerstoneTools) {

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    // TODO: make a generic data storage mechanism for elements that
    //       gets cleaned up when the element is destroyed
    var lengthData = {};

    function drawNewMeasurement(e, data, coords, scale)
    {
        data.handles.start.x = coords.x;
        data.handles.start.y = coords.y;
        data.handles.end.x = coords.x;
        data.handles.end.y = coords.y;
        data.visible = true;

        cornerstoneTools.handleCursorNearHandle(e, data, coords, scale);
    };

    function onMouseDown(e) {
        var element = e.currentTarget;
        var viewport = cornerstone.getViewport(element);
        var data = lengthData[element];
        if(e.which == data.whichMouseButton) {
            var coords = cornerstone.pageToImage(element, e.pageX, e.pageY);

            // if we have a visible length measurement, check to see if this point
            // is near one of its handles
            if(cornerstoneTools.handleCursorNearHandle(e, data, coords, viewport.scale) == true) {
                e.stopPropagation();
                return;
            }
            else
            {
                drawNewMeasurement(e, data, coords, viewport.scale);
                e.stopPropagation();
                return;
            }
        }
    };


    function onImageRendered(e)
    {
        var data = lengthData[e.detail.element];

        if(data.visible == false)
        {
            return;
        }

        var context = e.detail.canvasContext;
        context.beginPath();
        context.strokeStyle = 'white';
        context.lineWidth = e.detail.singlePixelLineWidth;
        context.moveTo(data.handles.start.x, data.handles.start.y);
        context.lineTo(data.handles.end.x, data.handles.end.y);
        context.stroke();
        context.beginPath();
        cornerstoneTools.drawHandles(context, e.detail.viewport, data.handles, e.detail.viewport.scale);
        context.stroke();
        context.fillStyle = "white";
        context.font = e.detail.mediumFontSize + " Arial";
        var dx = data.handles.start.x - data.handles.end.x * e.detail.image.columnPixelSpacing;
        var dy = data.handles.start.y - data.handles.end.y * e.detail.image.rowPixelSpacing;
        var length = Math.sqrt(dx * dx + dy * dy);
        var text = "" + length.toFixed(2) + " mm";
        context.fillText(text, (data.handles.start.x + data.handles.end.x) / 2, (data.handles.start.y + data.handles.end.y) / 2);
    };


    function onMouseMove(e)
    {
        // if a mouse button is down, ignore it
        if(e.which != 0) {
            return;
        }

        // get the data associated with this element or return if none
        var element = e.currentTarget;
        var data = lengthData[element];
        if(data === undefined) {
            return;
        }

        // get the cursor position in image coordinates
        var coords = cornerstone.pageToImage(element, e.pageX, e.pageY);

        var viewport = cornerstone.getViewport(element);

        if(cornerstoneTools.activateNearbyHandle(data.handles, coords, viewport.scale ) == true)
        {
            cornerstone.updateImage(element);
        }
    };

    function enableLength(element, whichMouseButton)
    {
        element.addEventListener("CornerstoneImageRendered", onImageRendered, false);

        var eventData =
        {
            whichMouseButton: whichMouseButton,
            visible : false,
            handles: {
                start: {
                    x:0,
                    y:0,
                    active: false
                },
                end: {
                    x:0,
                    y:0,
                    active: false
                }
            }
        };

        lengthData[element] = eventData;

        $(element).mousedown(onMouseDown);
        $(element).mousemove(onMouseMove);
    };

    function disableLength(element)
    {
        element.removeEventListener("CornerstoneImageRendered", onImageRendered);
        $(element).unbind('mousedown', onMouseDown);
        lengthData[element] = undefined;
    };

    // module/private exports
    cornerstoneTools.enableLength = enableLength;
    cornerstoneTools.disableLength = disableLength;

    return cornerstoneTools;
}($, cornerstone, cornerstoneCore, cornerstoneTools));