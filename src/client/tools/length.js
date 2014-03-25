var cornerstoneTools = (function ($, cornerstone, csc, cornerstoneTools) {

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    // TODO: Figure out how to delete length measurements.

    var toolType = 'length';

    function drawNewMeasurement(e, coords, scale)
    {
        // create the tool state data for this tool with the end handle activated
        var data = {
            visible : true,
            handles : {
                start : {
                    x : coords.x,
                    y : coords.y,
                    active: false
                },
                end: {
                    x : coords.x,
                    y : coords.y,
                    active: true
                }
            }
        };

        // associate this data with this imageId so we can render it and manipulate it
        cornerstoneTools.addToolState(e.currentTarget, toolType, data);

        // since we are dragging to another place to drop the end point, we can just activate
        // the end point and let the handleHelper move it for us.
        cornerstoneTools.handleHandle(e, data.handles.end);
    }

    function onMouseDown(e) {
        var eventData = e.data;
        if(e.which == eventData.whichMouseButton) {
            var element = e.currentTarget;
            var viewport = cornerstone.getViewport(element);
            var coords = cornerstone.pageToImage(element, e.pageX, e.pageY);
            var toolData = cornerstoneTools.getToolState(e.currentTarget, toolType);

            // first check to see if we have an existing length measurement that has a handle that we can move
            if(toolData !== undefined) {
                for(var i=0; i < toolData.data.length; i++) {
                    var data = toolData.data[i];
                    if(cornerstoneTools.handleCursorNearHandle(e, data, coords, viewport.scale) == true) {
                        e.stopPropagation();
                        return;
                    }
                }
            }

            // If we are "active" start drawing a new measurement
            if(eventData.active === true) {
                // no existing measurements care about this, draw a new measurement
                drawNewMeasurement(e, coords, viewport.scale);
                e.stopPropagation();
                return;
            }
        }
    }

    function onImageRendered(e)
    {
        // if we have no toolData for this element, return immediately as there is nothing to do
        var toolData = cornerstoneTools.getToolState(e.currentTarget, toolType);
        if(toolData === undefined) {
            return;
        }

        // we have tool data for this element - iterate over each one and draw it
        var context = e.detail.canvasContext.canvas.getContext("2d");
        csc.setToPixelCoordinateSystem(e.detail.enabledElement, context);

        for(var i=0; i < toolData.data.length; i++) {
            context.save();
            var data = toolData.data[i];

            // draw the line
            context.beginPath();
            context.strokeStyle = 'white';
            context.lineWidth = 1 / e.detail.viewport.scale;
            context.moveTo(data.handles.start.x, data.handles.start.y);
            context.lineTo(data.handles.end.x, data.handles.end.y);
            context.stroke();

            // draw the handles
            context.beginPath();
            cornerstoneTools.drawHandles(context, e.detail.viewport, data.handles, e.detail.viewport.scale);
            context.stroke();

            // Draw the text
            context.fillStyle = "white";
            var dx = data.handles.start.x - data.handles.end.x * e.detail.image.columnPixelSpacing;
            var dy = data.handles.start.y - data.handles.end.y * e.detail.image.rowPixelSpacing;
            var length = Math.sqrt(dx * dx + dy * dy);
            var text = "" + length.toFixed(2) + " mm";

            var fontParameters = csc.setToFontCoordinateSystem(e.detail.enabledElement, e.detail.canvasContext, 15);
            context.font = "" + fontParameters.fontSize + "px Arial";

            var textX = (data.handles.start.x + data.handles.end.x) / 2 / fontParameters.fontScale;
            var textY = (data.handles.start.y + data.handles.end.y) / 2 / fontParameters.fontScale;
            context.fillText(text, textX, textY);
            context.restore();
        }
    }

    function onMouseMove(e)
    {
        // if a mouse button is down, do nothing
        if(e.which != 0) {
            return;
        }

        // if we have no tool data for this element, do nothing
        var toolData = cornerstoneTools.getToolState(e.currentTarget, toolType);
        if(toolData === undefined) {
            return;
        }

        // We have tool data, search through all data
        // and see we can activate a handle
        var imageNeedsUpdate = false;
        for(var i=0; i < toolData.data.length; i++) {
            // get the cursor position in image coordinates
            var coords = cornerstone.pageToImage(element, e.pageX, e.pageY);
            var viewport = cornerstone.getViewport(element);
            var data = toolData.data[i];

            if(cornerstoneTools.activateNearbyHandle(data.handles, coords, viewport.scale ) == true)
            {
                imageNeedsUpdate = true;
            }
        }

        // Handle activation status changed, redraw the image
        if(imageNeedsUpdate === true) {
            cornerstone.updateImage(element);
        }
    }

    // enables the length tool on the specified element.  The length tool must first
    // be enabled before it can be activated.  Enabling it will allow it to display
    // any length measurements that already exist
    // NOTE: if we want to make this tool at all configurable, we can pass in an options object here
    function enable(element)
    {
        element.addEventListener("CornerstoneImageRendered", onImageRendered, false);
        cornerstone.updateImage(element);
        $(element).unbind('mousedown', onMouseDown);
        $(element).unbind('mousedown', onMouseMove);
    }

    // disables the length tool on the specified element.  This will cause existing
    // measurements to no longer be displayed.  You must re-enable the tool on an element
    // before you can activate it again.
    function disable(element)
    {
        deactivate(element);
        $(element).unbind('mousemove', onMouseMove);
        element.removeEventListener("CornerstoneImageRendered", onImageRendered);
        cornerstone.updateImage(element);
    }

    // hook the mousedown event so we can create a new measurement
    function activate(element, whichMouseButton)
    {
        // rehook the mnousedown with a new eventData that says we are active
        var eventData = {
            whichMouseButton: whichMouseButton,
            active: true
        };
        $(element).unbind('mousedown', onMouseDown);
        $(element).mousedown(eventData, onMouseDown);
        $(element).mousemove(onMouseMove);
    }

    // rehook mousedown with a new eventData that says we are not active
    function deactivate(element)
    {
        // TODO: we currently assume that left mouse button is used to move measurements, this should
        // probably be configurable
        var eventData = {
            whichMouseButton: 1,
            active: false
        };
        $(element).unbind('mousedown', onMouseDown);
        $(element).mousedown(eventData, onMouseDown);
        $(element).mousemove(onMouseMove);
    }

    // module exports
    cornerstoneTools.length = {
        enable: enable,
        disable : disable,
        activate: activate,
        deactivate: deactivate
    }

    return cornerstoneTools;
}($, cornerstone, cornerstoneCore, cornerstoneTools));