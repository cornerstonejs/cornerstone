var cornerstoneTools = (function ($, cornerstone, csc, cornerstoneTools) {

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var toolType = 'ellipticalRoi';


    function pointInEllipse(ellipse, location)
    {
        var xRadius = ellipse.width / 2;
        var yRadius = ellipse.height / 2;

        if (xRadius <= 0.0 || yRadius <= 0.0)
            return false;

        var center = {
            x: ellipse.left + xRadius,
            y: ellipse.top + yRadius
        };

        /* This is a more general form of the circle equation
         *
         * X^2/a^2 + Y^2/b^2 <= 1
         */

        var normalized = {
            x: location.x - center.x,
            y: location.y - center.y
        };

        var inEllipse = ((normalized.x * normalized.y) / (xRadius * xRadius)) + ((normalized.y * normalized.y) / (yRadius * yRadius)) <= 1.0;
        return inEllipse;
    };

    function calculateMeanStdDev(sp, ellipse)
    {
        // TODO: Get a real statistics library here that supports large counts

        var sum = 0;
        var sumSquared =0;
        var count = 0;
        var index =0;

        for(var y=ellipse.top; y < ellipse.top + ellipse.height; y++) {
            for(var x=ellipse.left; x < ellipse.left + ellipse.width; x++) {
                if(pointInEllipse(ellipse, {x: x, y: y}) == true)
                {
                    sum += sp[index];
                    sumSquared += sp[index] * sp[index];
                    count++;
                }
                index++;
            }
        }

        if(count == 0) {
            return {
                count: count,
                mean: 0.0,
                variance: 0.0,
                stdDev: 0.0
            };
        }

        var mean = sum / count;
        var variance = sumSquared / count - mean * mean;

        return {
            count: count,
            mean: mean,
            variance: variance,
            stdDev: Math.sqrt(variance)
        };

        return sum / count;
    };

    function drawNewMeasurement(e, coords, scale)
    {
        // create the tool state data for this tool with the end handle activated
        var data = {
            visible : true,
            handles : {
                start : {
                    x : coords.x,
                    y : coords.y,
                    highlight: true,
                    active: false
                },
                end: {
                    x : coords.x,
                    y : coords.y,
                    highlight: true,
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

    function pointNearTool(data, coords)
    {
        // TODO: Find a formula for shortest distance betwen point and ellipse.  Rectangle is close enough
        var rect = {
            left : Math.min(data.handles.start.x, data.handles.end.x),
            top : Math.min(data.handles.start.y, data.handles.end.y),
            width : Math.abs(data.handles.start.x - data.handles.end.x),
            height : Math.abs(data.handles.start.y - data.handles.end.y)
        };

        return cornerstoneTools.lineHelper.pointNearRect(coords, rect);
    }

    function onMouseDown(e) {
        var eventData = e.data;
        if(e.which == eventData.whichMouseButton) {
            var element = e.currentTarget;
            var viewport = cornerstone.getViewport(element);
            var coords = cornerstone.pageToImage(element, e.pageX, e.pageY);
            var toolData = cornerstoneTools.getToolState(e.currentTarget, toolType);

            // first check to see if we have an existing measurement that has a handle that we can move
            if(toolData !== undefined) {
                for(var i=0; i < toolData.data.length; i++) {
                    var data = toolData.data[i];
                    if(cornerstoneTools.handleCursorNearHandle(e, data, coords, viewport.scale) == true) {
                        e.stopImmediatePropagation();
                        return;
                    }
                }
            }

            // now check to see if we have a tool that we can move
            if(toolData !== undefined) {
                for(var i=0; i < toolData.data.length; i++) {
                    var data = toolData.data[i];
                    if(pointNearTool(data, coords)) {
                        cornerstoneTools.moveAllHandles(e, data, toolData, true);
                        e.stopImmediatePropagation();
                        return;
                    }
                }
            }

            // If we are "active" start drawing a new measurement
            if(eventData.active === true) {
                // no existing measurements care about this, draw a new measurement
                drawNewMeasurement(e, coords, viewport.scale);
                e.stopImmediatePropagation();
                return;
            }
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
        // and see if the mouse cursor is close enough
        // to the tool to make it interactive (by highlighting
        // all handles) and close enough to make a handle draggable

        var imageNeedsUpdate = false;
        for(var i=0; i < toolData.data.length; i++) {
            // get the cursor position in image coordinates
            var coords = cornerstone.pageToImage(element, e.pageX, e.pageY);
            var viewport = cornerstone.getViewport(element);
            var data = toolData.data[i];

            if(pointNearTool(data, coords) === true)
            {
                if(cornerstoneTools.setHighlightForAllHandles(data, true))
                {
                    imageNeedsUpdate = true;
                }
                if(cornerstoneTools.activateNearbyHandle(data.handles, coords, viewport.scale))
                {
                    imageNeedsUpdate = true;
                }

            }
            else
            {
                if(cornerstoneTools.deactivateAndUnhighlightAllHandles(data))
                {
                    imageNeedsUpdate = true;
                }
            }
        }

        // Handle activation status changed, redraw the image
        if(imageNeedsUpdate === true) {
            cornerstone.updateImage(element);
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

            // draw the ellipse
            var width = Math.abs(data.handles.start.x - data.handles.end.x);
            var height = Math.abs(data.handles.start.y - data.handles.end.y);
            var left = Math.min(data.handles.start.x, data.handles.end.x);
            var top = Math.min(data.handles.start.y, data.handles.end.y);
            var centerX = (data.handles.start.x + data.handles.end.x) / 2;
            var centerY = (data.handles.start.y + data.handles.end.y) / 2;

            var context = e.detail.canvasContext;
            context.beginPath();
            context.strokeStyle = 'white';
            context.lineWidth = 1 / e.detail.viewport.scale;
            csc.drawEllipse(context, left, top, width, height);
            context.closePath();

            // draw the handles
            context.beginPath();
            cornerstoneTools.drawHandles(context, e.detail.viewport, data.handles, e.detail.viewport.scale);
            context.stroke();

            // Calculate the mean, stddev, and area
            // TODO: calculate this in web worker for large pixel counts...
            var storedPixels = cornerstone.getStoredPixels(e.detail.element, left, top, width, height);
            var ellipse = {
                left: left,
                top: top,
                width: width,
                height: height
            };
            var meanStdDev = calculateMeanStdDev(storedPixels, ellipse);
            var area = Math.PI * (width * e.detail.image.columnPixelSpacing / 2) * (height * e.detail.image.rowPixelSpacing / 2);
            var areaText = "Area: " + area.toFixed(2) + " mm^2";

            // Draw text
            var fontParameters = csc.setToFontCoordinateSystem(e.detail.enabledElement, e.detail.canvasContext, 15);
            context.font = "" + fontParameters.fontSize + "px Arial";

            var textSize = context.measureText(area);

            var offset = fontParameters.lineHeight;
            var textX  = centerX < (e.detail.image.columns / 2) ? centerX + (width /2): centerX - (width/2) - textSize.width * fontParameters.fontScale;
            var textY  = centerY < (e.detail.image.rows / 2) ? centerY + (height /2): centerY - (height/2);

            var textX = textX / fontParameters.fontScale;
            var textY = textY / fontParameters.fontScale;

            context.fillStyle = "white";
            context.fillText("Mean: " + meanStdDev.mean.toFixed(2), textX, textY - offset);
            context.fillText("StdDev: " + meanStdDev.stdDev.toFixed(2), textX, textY);
            context.fillText(areaText, textX, textY + offset);
            context.restore();
        }
    }

    // enables the tool on the specified element.  The tool must first
    // be enabled before it can be activated.  Enabling it will allow it to display
    // any measurements that already exist
    // NOTE: if we want to make this tool at all configurable, we can pass in an options object here
    function enable(element)
    {
        element.addEventListener("CornerstoneImageRendered", onImageRendered, false);
        $(element).unbind('mousedown', onMouseDown);
        $(element).unbind('mousemove', onMouseMove);
        cornerstone.updateImage(element);
    }

    // disables the tool on the specified element.  This will cause existing
    // measurements to no longer be displayed.  You must re-enable the tool on an element
    // before you can activate it again.
    function disable(element)
    {
        element.removeEventListener("CornerstoneImageRendered", onImageRendered);
        $(element).unbind('mousedown', onMouseDown);
        $(element).unbind('mousemove', onMouseMove);
        cornerstone.updateImage(element);
    }

    // hook the mousedown event so we can create a new measurement
    function activate(element, whichMouseButton)
    {
        element.addEventListener("CornerstoneImageRendered", onImageRendered, false);
        $(element).unbind('mousedown', onMouseDown);
        $(element).unbind('mousemove', onMouseMove);
        var eventData = {
            whichMouseButton: whichMouseButton,
            active: true
        };
        $(element).mousedown(eventData, onMouseDown);
        $(element).mousemove(onMouseMove);
        cornerstone.updateImage(element);
    }

    // rehook mousedown with a new eventData that says we are not active
    function deactivate(element)
    {
        element.addEventListener("CornerstoneImageRendered", onImageRendered, false);
        $(element).unbind('mousedown', onMouseDown);
        $(element).unbind('mousemove', onMouseMove);
        // TODO: we currently assume that left mouse button is used to move measurements, this should
        // probably be configurable
        var eventData = {
            whichMouseButton: 1,
            active: false
        };
        $(element).mousedown(eventData, onMouseDown);
        $(element).mousemove(onMouseMove);
        cornerstone.updateImage(element);
    }

    // module/private exports
    //cornerstoneTools.enableEllipticalRoi = enableEllipticalRoi;
    //cornerstoneTools.disableEllipticalRoi = disableEllipticalRoi;

    cornerstoneTools.ellipticalRoi = {
        enable: enable,
        disable : disable,
        activate: activate,
        deactivate: deactivate
    }

    return cornerstoneTools;
}($, cornerstone, cornerstoneCore, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, csc, cornerstoneTools) {

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var handleRadius = 6;

    function findHandleNear(handles, imagePoint, scale)
    {
        var handleRadiusScaled = handleRadius / scale;

        for(var property in handles) {
            var handle = handles[property];
            var distance = csc.distance(imagePoint, handle);
            if(distance <= handleRadiusScaled)
            {
                return handle;
            }
        }
        return undefined;
    }

    function getActiveHandle(handles) {
        for(var property in handles) {
            var handle = handles[property];
            if(handle.active === true) {
                return handle;
            }
        }
        return undefined;
    }

    function activateNearbyHandle(handles, imagePoint, scale)
    {
        var activeHandle = getActiveHandle(handles);
        var nearbyHandle = findHandleNear(handles, imagePoint, scale);
        if(activeHandle != nearbyHandle)
        {
            if(nearbyHandle !== undefined) {
                nearbyHandle.active = true;
            }
            if(activeHandle != undefined) {
                activeHandle.active = false;
            }
            return true;
        }
        return false;
    }

    function handleCursorNearHandle(e, data, coords, scale, deleteToolDataWhenDone) {

        if(data.visible === false) {
            return false;
        }

        var nearbyHandle = cornerstoneTools.findHandleNear(data.handles, coords, scale)
        if(nearbyHandle == undefined)
        {
            return false;
        }

        return handleHandle(e, nearbyHandle);

    }

    function handleHandle(e, handle, deleteToolDataWhenDone)
    {
        var element = e.currentTarget;

        $(document).mousemove(function(e) {
            var coords = cornerstone.pageToImage(element, e.pageX, e.pageY);
            handle.x = coords.x;
            handle.y = coords.y;
            cornerstone.updateImage(element);
        });

        $(document).mouseup(function(e) {
            handle.active = false;
            $(document).unbind('mousemove');
            $(document).unbind('mouseup');

            /*
            if(deleteToolDataWhenDone === true) {
                var toolData = cornerstoneTools.getToolState(e.currentTarget, toolType);
                var indexOfData = -1;
                for(var i = 0; i < toolData.data.length; i++) {
                    if(toolData.data[i] === data)
                    {
                        console.log("found tool");
                        indexOfData = i;
                    }
                }
                if(indexOfData !== -1) {
                    console.log("deleteing tool");
                    toolData.data.splice(indexOfData, 1);
                }

            }
            */

            cornerstone.updateImage(element);
        });

        return true;
    }

    function setHighlightForAllHandles(data, highlighted)
    {
        var changed = false
        for(var property in data.handles) {
            var handle = data.handles[property];
            if(handle.highlight !== highlighted) {
                handle.highlight = highlighted;
                changed = true;
            }
        }
        return changed;
    }

    function drawHandles(context, viewport, handles)
    {
        context.strokeStyle = 'white';
        var radius = handleRadius / viewport.scale;
        for(var property in handles) {
            var handle = handles[property];
            if(handle.active || handle.highlight) {
                context.beginPath();
                if(handle.active)
                {
                    context.lineWidth = 1 / viewport.scale;
                }
                else
                {
                    context.lineWidth = .5 / viewport.scale;
                }
                context.arc(handle.x, handle.y, radius, 0, 2 * Math.PI);
                context.stroke();
            }
        }
    }

    function pointOutsideImage(point, image)
    {
        if( point.x < 0
            || point.x > image.width
            || point.y < 0
            || point.y > image.height)
        {
            return true;
        }
        return false;
    }

    function moveAllHandles(e, data, toolData, deleteIfHandleOutsideImage)
    {
        var element = e.currentTarget;

        var lastCoord = cornerstone.pageToImage(element, e.pageX, e.pageY);

        $(document).mousemove(function(e) {
            var coords = cornerstone.pageToImage(element, e.pageX, e.pageY);
            for(var property in data.handles) {
                var handle = data.handles[property];
                handle.x += coords.x - lastCoord.x;
                handle.y += coords.y - lastCoord.y;
            }
            lastCoord = coords;
            cornerstone.updateImage(element);
        });

        $(document).mouseup(function(e) {
            data.moving = false;
            $(document).unbind('mousemove');
            $(document).unbind('mouseup');
            // If any handle is outside the image, delete the tool data

            if(deleteIfHandleOutsideImage === true) {
                var image = cornerstone.getEnabledElement(element).image;
                var handleOutsideImage = false;
                for(var property in data.handles) {
                    var handle = data.handles[property];
                    if(pointOutsideImage(handle, image)
                        || pointOutsideImage(data.handles.end, image))
                    {
                        handleOutsideImage = true;
                    }
                }

                if(handleOutsideImage)
                {
                    // find this tool data
                    var indexOfData = -1;
                    for(var i = 0; i < toolData.data.length; i++) {
                        if(toolData.data[i] === data)
                        {
                            console.log("found tool");
                            indexOfData = i;
                        }
                    }
                    if(indexOfData !== -1) {
                        console.log("deleteing tool");
                        toolData.data.splice(indexOfData, 1);
                    }
                }
            }
            cornerstone.updateImage(element);
        });

        return true;
    }

    function deactivateAndUnhighlightAllHandles(data)
    {
        var changed = false
        for(var property in data.handles) {
            var handle = data.handles[property];
            if(handle.active) {
                handle.active = false;
                changed = true;
            }
            if(handle.highlight) {
                handle.highlight = false;
                changed = true;
            }
        }
        return changed;
    }

    // module/private exports
    cornerstoneTools.findHandleNear = findHandleNear;
    cornerstoneTools.handleCursorNearHandle = handleCursorNearHandle;
    cornerstoneTools.drawHandles = drawHandles;
    cornerstoneTools.activateNearbyHandle = activateNearbyHandle;
    cornerstoneTools.handleHandle = handleHandle;
    cornerstoneTools.setHighlightForAllHandles = setHighlightForAllHandles;
    cornerstoneTools.moveAllHandles = moveAllHandles;
    cornerstoneTools.deactivateAndUnhighlightAllHandles = deactivateAndUnhighlightAllHandles;
    return cornerstoneTools;
}($, cornerstone, cornerstoneCore, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, csc, cornerstoneTools) {

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    // This implements an imageId specific tool state management strategy.  This means that
    // measurements data is tied to a specific imageId and only visible for enabled elements
    // that are displaying that imageId.

    function newImageIdSpecificToolStateManager() {
        var toolState = {};

        // here we add tool state, this is done by tools as well
        // as modules that restore saved state
        function addImageIdSpecificToolState(element, toolType, data)
        {
            var enabledImage = cornerstone.getEnabledElement(element);
            // if we don't have any tool state for this imageId, add an empty object
            if(toolState.hasOwnProperty(enabledImage.ids.imageId) == false)
            {
                toolState[enabledImage.ids.imageId] = {};
            }
            var imageIdToolState = toolState[enabledImage.ids.imageId];

            // if we don't have tool state for this type of tool, add an empty object
            if(imageIdToolState.hasOwnProperty(toolType) == false)
            {
                imageIdToolState[toolType] = {
                    data: []
                };
            }
            var toolData = imageIdToolState[toolType];

            // finally, add this new tool to the state
            toolData.data.push(data);
        };

        // here you can get state - used by tools as well as modules
        // that save state persistently
        function getImageIdSpecificToolState(element, toolType)
        {
            var enabledImage = cornerstone.getEnabledElement(element);
            // if we don't have any tool state for this imageId, return undefined
            if(toolState.hasOwnProperty(enabledImage.ids.imageId) == false)
            {
                return undefined;
            }
            var imageIdToolState = toolState[enabledImage.ids.imageId];

            // if we don't have tool state for this type of tool, return undefined
            if(imageIdToolState.hasOwnProperty(toolType) == false)
            {
                return undefined;
            }
            var toolData = imageIdToolState[toolType];
            return toolData;
        };

        var imageIdToolStateManager = {
            get: getImageIdSpecificToolState,
            add: addImageIdSpecificToolState
        };
        return imageIdToolStateManager;
    };

    // a global imageIdSpecificToolStateManager - the most common case is to share state between all
    // visible enabled images
    var globalImageIdSpecificToolStateManager = newImageIdSpecificToolStateManager();

    // module/private exports
    cornerstoneTools.newImageIdSpecificToolStateManager = newImageIdSpecificToolStateManager;
    cornerstoneTools.globalImageIdSpecificToolStateManager = globalImageIdSpecificToolStateManager;

    return cornerstoneTools;
}($, cornerstone, cornerstoneCore, cornerstoneTools));
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
                    highlight: true,
                    active: false
                },
                end: {
                    x : coords.x,
                    y : coords.y,
                    highlight: true,
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
                        e.stopImmediatePropagation();
                        return;
                    }
                }
            }

            // now check to see if we have a tool that we can move
            if(toolData !== undefined) {
                for(var i=0; i < toolData.data.length; i++) {
                    var data = toolData.data[i];
                    if(pointNearTool(data, coords)) {
                        cornerstoneTools.moveAllHandles(e, data, toolData, true);
                        e.stopImmediatePropagation();
                        return;
                    }
                }
            }

            // If we are "active" start drawing a new measurement
            if(eventData.active === true) {
                // no existing measurements care about this, draw a new measurement
                drawNewMeasurement(e, coords, viewport.scale);
                e.stopImmediatePropagation();
                return;
            }
        }
    }

    // from http://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
    function sqr(x) { return x * x }
    function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y) }
    function distToSegmentSquared(p, v, w) {
        var l2 = dist2(v, w);
        if (l2 == 0) return dist2(p, v);
        var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
        if (t < 0) return dist2(p, v);
        if (t > 1) return dist2(p, w);
        return dist2(p, { x: v.x + t * (w.x - v.x),
            y: v.y + t * (w.y - v.y) });
    }
    function distToSegment(p, v, w) { return Math.sqrt(distToSegmentSquared(p, v, w)); }


    function pointNearTool(data, coords)
    {
        var distance = distToSegment(coords, data.handles.start, data.handles.end);
        return (distance < 5);
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
        // and see if the mouse cursor is close enough
        // to the tool to make it interactive (by highlighting
        // all handles) and close enough to make a handle draggable

        var imageNeedsUpdate = false;
        for(var i=0; i < toolData.data.length; i++) {
            // get the cursor position in image coordinates
            var coords = cornerstone.pageToImage(element, e.pageX, e.pageY);
            var viewport = cornerstone.getViewport(element);
            var data = toolData.data[i];

            if(cornerstoneTools.lineHelper.pointNearLineSegment(coords, data.handles) === true)
            {
                if(cornerstoneTools.setHighlightForAllHandles(data, true))
                {
                    imageNeedsUpdate = true;
                }
                if(cornerstoneTools.activateNearbyHandle(data.handles, coords, viewport.scale))
                {
                    imageNeedsUpdate = true;
                }
            }
            else
            {
                if(cornerstoneTools.deactivateAndUnhighlightAllHandles(data))
                {
                    imageNeedsUpdate = true;
                }
            }
        }

        // Handle activation status changed, redraw the image
        if(imageNeedsUpdate === true) {
            cornerstone.updateImage(element);
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

    // enables the length tool on the specified element.  The length tool must first
    // be enabled before it can be activated.  Enabling it will allow it to display
    // any length measurements that already exist
    // NOTE: if we want to make this tool at all configurable, we can pass in an options object here
    function enable(element)
    {
        element.addEventListener("CornerstoneImageRendered", onImageRendered, false);
        $(element).unbind('mousedown', onMouseDown);
        $(element).unbind('mousemove', onMouseMove);
        cornerstone.updateImage(element);
    }

    // disables the length tool on the specified element.  This will cause existing
    // measurements to no longer be displayed.  You must re-enable the tool on an element
    // before you can activate it again.
    function disable(element)
    {
        element.removeEventListener("CornerstoneImageRendered", onImageRendered);
        $(element).unbind('mousedown', onMouseDown);
        $(element).unbind('mousemove', onMouseMove);
        cornerstone.updateImage(element);
    }

    // hook the mousedown event so we can create a new measurement
    function activate(element, whichMouseButton)
    {
        element.addEventListener("CornerstoneImageRendered", onImageRendered, false);
        $(element).unbind('mousedown', onMouseDown);
        $(element).unbind('mousemove', onMouseMove);
        var eventData = {
            whichMouseButton: whichMouseButton,
            active: true
        };
        $(element).mousedown(eventData, onMouseDown);
        $(element).mousemove(onMouseMove);
        cornerstone.updateImage(element);
    }

    // rehook mousedown with a new eventData that says we are not active
    function deactivate(element)
    {
        element.addEventListener("CornerstoneImageRendered", onImageRendered, false);
        $(element).unbind('mousedown', onMouseDown);
        $(element).unbind('mousemove', onMouseMove);
        // TODO: we currently assume that left mouse button is used to move measurements, this should
        // probably be configurable
        var eventData = {
            whichMouseButton: 1,
            active: false
        };
        $(element).mousedown(eventData, onMouseDown);
        $(element).mousemove(onMouseMove);
        cornerstone.updateImage(element);
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
var cornerstoneTools = (function ($, cornerstone, csc, cornerstoneTools) {

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    // from http://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
    function sqr(x) { return x * x }
    function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y) }
    function distToSegmentSquared(p, v, w) {
        var l2 = dist2(v, w);
        if (l2 == 0) return dist2(p, v);
        var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
        if (t < 0) return dist2(p, v);
        if (t > 1) return dist2(p, w);
        return dist2(p, { x: v.x + t * (w.x - v.x),
            y: v.y + t * (w.y - v.y) });
    }
    function distToSegment(p, v, w) { return Math.sqrt(distToSegmentSquared(p, v, w)); }


    function pointNearLineSegment(point, lineSegment, maxDistance)
    {
        if(maxDistance === undefined) {
            maxDistance = 5;
        }
        var distance = distToSegment(point, lineSegment.start, lineSegment.end);

        return (distance < maxDistance);
    }

    function rectToLineSegments(rect)
    {
        var top = {
            start : {
                x :rect.left,
                y :rect.top
            },
            end : {
                x :rect.left + rect.width,
                y :rect.top

            }
        };
        var right = {
            start : {
                x :rect.left + rect.width,
                y :rect.top
            },
            end : {
                x :rect.left + rect.width,
                y :rect.top + rect.height

            }
        };
        var bottom = {
            start : {
                x :rect.left + rect.width,
                y :rect.top + rect.height
            },
            end : {
                x :rect.left,
                y :rect.top + rect.height

            }
        };
        var left = {
            start : {
                x :rect.left,
                y :rect.top + rect.height
            },
            end : {
                x :rect.left,
                y :rect.top

            }
        };
        var lineSegments = [top, right, bottom, left];
        return lineSegments;
    }

    function pointNearRect(point, rect, maxDistance)
    {
        var found = false;
        var lineSegments = rectToLineSegments(rect);
        lineSegments.forEach(function(lineSegment) {
            if(pointNearLineSegment(point, lineSegment, maxDistance))
            {
                found = true;
            }
        })
        return found;
    }

    // module exports
    cornerstoneTools.lineHelper = {
        pointNearLineSegment: pointNearLineSegment,
        pointNearRect: pointNearRect,
    }

    return cornerstoneTools;
}($, cornerstone, cornerstoneCore, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function onMouseDown(e){


        var eventData = e.data;
        var element = e.currentTarget;
        if(e.which == eventData.whichMouseButton) {

            var lastX = e.pageX;
            var lastY = e.pageY;

            $(document).mousemove(function(e) {
                var deltaX = e.pageX - lastX,
                    deltaY = e.pageY - lastY ;
                lastX = e.pageX;
                lastY = e.pageY;

                var viewport = cornerstone.getViewport(element);
                viewport.centerX += (deltaX / viewport.scale);
                viewport.centerY += (deltaY / viewport.scale);
                cornerstone.setViewport(element, viewport);
            });

            $(document).mouseup(function(e) {
                $(document).unbind('mousemove');
                $(document).unbind('mouseup');
            });
        }
    }


    // enables the length tool on the specified element.  The length tool must first
    // be enabled before it can be activated.  Enabling it will allow it to display
    // any length measurements that already exist
    // NOTE: if we want to make this tool at all configurable, we can pass in an options object here
    function enable(element)
    {
        $(element).unbind('mousedown', onMouseDown);
    }

    // disables the length tool on the specified element.  This will cause existing
    // measurements to no longer be displayed.  You must re-enable the tool on an element
    // before you can activate it again.
    function disable(element)
    {
        $(element).unbind('mousedown', onMouseDown);
    }

    // hook the mousedown event so we can create a new measurement
    function activate(element, whichMouseButton)
    {
        $(element).unbind('mousedown', onMouseDown);
        var eventData = {
            whichMouseButton: whichMouseButton,
            active: true
        };
        $(element).mousedown(eventData, onMouseDown);
    }

    // rehook mousedown with a new eventData that says we are not active
    function deactivate(element)
    {
        $(element).unbind('mousedown', onMouseDown);
        // TODO: we currently assume that left mouse button is used to move measurements, this should
        // probably be configurable
        var eventData = {
            whichMouseButton: 1,
            active: false
        };
        $(element).mousedown(eventData, onMouseDown);
    }

    // module exports
    cornerstoneTools.pan = {
        enable: enable,
        disable : disable,
        activate: activate,
        deactivate: deactivate
    }

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, csc, cornerstoneTools) {

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var toolType = 'probe';

    function drawNewMeasurement(e, coords, scale)
    {
        // create the tool state data for this tool with the end handle activated
        var data = {
            visible : true,
            handles : {
                end: {
                    x : coords.x,
                    y : coords.y,
                    highlight: true,
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

            // first check to see if we have an existing measurement that has a handle that we can move
            if(toolData !== undefined) {
                for(var i=0; i < toolData.data.length; i++) {
                    var data = toolData.data[i];
                    if(cornerstoneTools.findHandleNear(data.handles, coords, viewport.scale)) {
                        cornerstoneTools.moveAllHandles(e, data, toolData, true);
                        e.stopImmediatePropagation();
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

            // draw the handles
            context.beginPath();
            cornerstoneTools.drawHandles(context, e.detail.viewport, data.handles, e.detail.viewport.scale);
            context.stroke();

            // Draw text
            var fontParameters = csc.setToFontCoordinateSystem(e.detail.enabledElement, e.detail.canvasContext, 15);
            context.font = "" + fontParameters.fontSize + "px Arial";

            // translate the x/y away from the cursor
            var x = Math.round(data.handles.end.x);
            var y = Math.round(data.handles.end.y);
            textX = data.handles.end.x + 3;
            textY = data.handles.end.y - 3;

            var textX = textX / fontParameters.fontScale;
            var textY = textY / fontParameters.fontScale;

            context.fillStyle = "white";

            var storedPixels = cornerstone.getStoredPixels(e.detail.element, x, y, 1, 1);
            var sp = storedPixels[0];
            var mo = sp * e.detail.image.slope + e.detail.image.intercept;


            context.fillText("" + x + "," + y, textX, textY);
            context.fillText("SP: " + sp + " MO: " + mo, textX, textY + fontParameters.lineHeight);

            context.restore();
        }
    }

    // enables the tool on the specified element.  The tool must first
    // be enabled before it can be activated.  Enabling it will allow it to display
    // any measurements that already exist
    // NOTE: if we want to make this tool at all configurable, we can pass in an options object here
    function enable(element)
    {
        element.addEventListener("CornerstoneImageRendered", onImageRendered, false);
        cornerstone.updateImage(element);
        $(element).unbind('mousedown', onMouseDown);
        $(element).unbind('mousemove', onMouseMove);
    }

    // disables the tool on the specified element.  This will cause existing
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

    // module/private exports
    //cornerstoneTools.enableEllipticalRoi = enableEllipticalRoi;
    //cornerstoneTools.disableEllipticalRoi = disableEllipticalRoi;

    cornerstoneTools.probe = {
        enable: enable,
        disable : disable,
        activate: activate,
        deactivate: deactivate
    }

    return cornerstoneTools;
}($, cornerstone, cornerstoneCore, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, csc, cornerstoneTools) {

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }


    var toolType = 'rectangleRoi';

    function calculateMeanStdDev(sp)
    {
        // TODO: Get a real statistics library here that supports large counts
        if(sp.length == 0) {
            return {
                count: 0,
                mean: 0.0,
                variance: 0.0,
                stdDev: 0.0
            };
        }

        var sum = 0;
        var sumSquared =0;

        for(var i=0; i < sp.length; i++) {
            sum += sp[i];
            sumSquared += sp[i] * sp[i];
        }

        var mean = sum / sp.length;
        var variance = sumSquared / sp.length - mean * mean;

        return {
            count: sp.length,
            mean: mean,
            variance: variance,
            stdDev: Math.sqrt(variance)
        };
    }

    function drawNewMeasurement(e, coords, scale)
    {
        // create the tool state data for this tool with the end handle activated
        var data = {
            visible : true,
            handles : {
                start : {
                    x : coords.x,
                    y : coords.y,
                    highlight: true,
                    active: false
                },
                end: {
                    x : coords.x,
                    y : coords.y,
                    highlight: true,
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

    function pointNearTool(data, coords)
    {
        var rect = {
            left : Math.min(data.handles.start.x, data.handles.end.x),
            top : Math.min(data.handles.start.y, data.handles.end.y),
            width : Math.abs(data.handles.start.x - data.handles.end.x),
            height : Math.abs(data.handles.start.y - data.handles.end.y)
        };

        return cornerstoneTools.lineHelper.pointNearRect(coords, rect);
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
                        e.stopImmediatePropagation();
                        return;
                    }
                }
            }

            // now check to see if we have a tool that we can move
            if(toolData !== undefined) {
                for(var i=0; i < toolData.data.length; i++) {
                    var data = toolData.data[i];
                    if(pointNearTool(data, coords)) {
                        cornerstoneTools.moveAllHandles(e, data, toolData, true);
                        e.stopImmediatePropagation();
                        return;
                    }
                }
            }

            // If we are "active" start drawing a new measurement
            if(eventData.active === true) {
                // no existing measurements care about this, draw a new measurement
                drawNewMeasurement(e, coords, viewport.scale);
                e.stopImmediatePropagation();
                return;
            }
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
        // and see if the mouse cursor is close enough
        // to the tool to make it interactive (by highlighting
        // all handles) and close enough to make a handle draggable

        var imageNeedsUpdate = false;
        for(var i=0; i < toolData.data.length; i++) {
            // get the cursor position in image coordinates
            var coords = cornerstone.pageToImage(element, e.pageX, e.pageY);
            var viewport = cornerstone.getViewport(element);
            var data = toolData.data[i];

            if(pointNearTool(data, coords) === true)
            {
                if(cornerstoneTools.setHighlightForAllHandles(data, true))
                {
                    imageNeedsUpdate = true;
                }
                if(cornerstoneTools.activateNearbyHandle(data.handles, coords, viewport.scale))
                {
                    imageNeedsUpdate = true;
                }
            }
            else
            {
                if(cornerstoneTools.deactivateAndUnhighlightAllHandles(data))
                {
                    imageNeedsUpdate = true;
                }
            }
        }

        // Handle activation status changed, redraw the image
        if(imageNeedsUpdate === true) {
            cornerstone.updateImage(element);
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

            // draw the rectangle
            var width = Math.abs(data.handles.start.x - data.handles.end.x);
            var height = Math.abs(data.handles.start.y - data.handles.end.y);
            var left = Math.min(data.handles.start.x, data.handles.end.x);
            var top = Math.min(data.handles.start.y, data.handles.end.y);
            var centerX = (data.handles.start.x + data.handles.end.x) / 2;
            var centerY = (data.handles.start.y + data.handles.end.y) / 2;

            var context = e.detail.canvasContext;
            context.beginPath();
            context.strokeStyle = 'white';
            context.lineWidth = 1 / e.detail.viewport.scale;
            context.rect(left, top, width, height);
            context.stroke();


            // draw the handles
            context.beginPath();
            cornerstoneTools.drawHandles(context, e.detail.viewport, data.handles, e.detail.viewport.scale);
            context.stroke();

            // Calculate the mean, stddev, and area
            // TODO: calculate this in web worker for large pixel counts...
            var storedPixels = cornerstone.getStoredPixels(e.detail.element, left, top, width, height);
            var meanStdDev = calculateMeanStdDev(storedPixels);
            var area = Math.PI * (width * e.detail.image.columnPixelSpacing / 2) * (height * e.detail.image.rowPixelSpacing / 2);
            var areaText = "Area: " + area.toFixed(2) + " mm^2";

            // Draw text
            var fontParameters = csc.setToFontCoordinateSystem(e.detail.enabledElement, e.detail.canvasContext, 15);
            context.font = "" + fontParameters.fontSize + "px Arial";

            var textSize = context.measureText(area);

            var offset = fontParameters.lineHeight;
            var textX  = centerX < (e.detail.image.columns / 2) ? centerX + (width /2): centerX - (width/2) - textSize.width * fontParameters.fontScale;
            var textY  = centerY < (e.detail.image.rows / 2) ? centerY + (height /2): centerY - (height/2);

            var textX = textX / fontParameters.fontScale;
            var textY = textY / fontParameters.fontScale;

            context.fillStyle = "white";
            context.fillText("Mean: " + meanStdDev.mean.toFixed(2), textX, textY - offset);
            context.fillText("StdDev: " + meanStdDev.stdDev.toFixed(2), textX, textY);
            context.fillText(areaText, textX, textY + offset);
            context.restore();
        }
    }

    // enables the tool on the specified element.  The tool must first
    // be enabled before it can be activated.  Enabling it will allow it to display
    // any measurements that already exist
    // NOTE: if we want to make this tool at all configurable, we can pass in an options object here
    function enable(element)
    {
        element.addEventListener("CornerstoneImageRendered", onImageRendered, false);
        $(element).unbind('mousedown', onMouseDown);
        $(element).unbind('mousemove', onMouseMove);
        cornerstone.updateImage(element);
    }

    // disables the tool on the specified element.  This will cause existing
    // measurements to no longer be displayed.  You must re-enable the tool on an element
    // before you can activate it again.
    function disable(element)
    {
        element.removeEventListener("CornerstoneImageRendered", onImageRendered);
        $(element).unbind('mousedown', onMouseDown);
        $(element).unbind('mousemove', onMouseMove);
        cornerstone.updateImage(element);
    }

    // hook the mousedown event so we can create a new measurement
    function activate(element, whichMouseButton)
    {
        element.addEventListener("CornerstoneImageRendered", onImageRendered, false);
        $(element).unbind('mousedown', onMouseDown);
        $(element).unbind('mousemove', onMouseMove);
        var eventData = {
            whichMouseButton: whichMouseButton,
            active: true
        };
        $(element).mousedown(eventData, onMouseDown);
        $(element).mousemove(onMouseMove);
        cornerstone.updateImage(element);
    }

    // rehook mousedown with a new eventData that says we are not active
    function deactivate(element)
    {
        element.addEventListener("CornerstoneImageRendered", onImageRendered, false);
        $(element).unbind('mousedown', onMouseDown);
        $(element).unbind('mousemove', onMouseMove);
        // TODO: we currently assume that left mouse button is used to move measurements, this should
        // probably be configurable
        var eventData = {
            whichMouseButton: 1,
            active: false
        };
        $(element).mousedown(eventData, onMouseDown);
        $(element).mousemove(onMouseMove);
        cornerstone.updateImage(element);
    }

    // module/private exports
    //cornerstoneTools.enableEllipticalRoi = enableEllipticalRoi;
    //cornerstoneTools.disableEllipticalRoi = disableEllipticalRoi;

    cornerstoneTools.rectangleRoi = {
        enable: enable,
        disable : disable,
        activate: activate,
        deactivate: deactivate
    }

    return cornerstoneTools;
}($, cornerstone, cornerstoneCore, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function scroll(element, stacks, whichMouseButton){
        var currentImageIdIndex = 0;
        var currentStackIndex = 0;
        var stackStateManagers = [];

        var oldStateManager = cornerstoneTools.getElementToolStateManager(element);
        if(oldStateManager === undefined) {
            oldStateManager = cornerstoneTools.globalImageIdSpecificToolStateManager;
        }

        var stackTools = ['length'];
        stacks.forEach(function(stack) {
            var stackSpecificStateManager = cornerstoneTools.newStackSpecificToolStateManager(stackTools, oldStateManager);
            stackStateManagers.push(stackSpecificStateManager);
        });

        cornerstoneTools.setElementToolStateManager(element, stackStateManagers[0]);

        if(whichMouseButton == 0) {
            $(element).on('mousewheel DOMMouseScroll', function(e) {
                var currentStack = stacks[currentStackIndex];
                // Firefox e.originalEvent.detail > 0 scroll back, < 0 scroll forward
                // chrome/safari e.originalEvent.wheelDelta < 0 scroll back, > 0 scroll forward
                if(e.originalEvent.wheelDelta < 0 || e.originalEvent.detail > 0) {
                    if(currentImageIdIndex < (currentStack.imageIds.length - 1)) {
                        currentImageIdIndex++;
                        cornerstone.newStackImage(element, currentStack.imageIds[currentImageIdIndex]);
                    }
                    else {
                        if(currentStackIndex < stacks.length - 1) {
                            currentStackIndex++;
                            currentStack = stacks[currentStackIndex];
                            currentImageIdIndex = 0;
                            cornerstoneTools.setElementToolStateManager(element, stackStateManagers[currentStackIndex]);
                            cornerstone.newStack(element, currentStack.imageIds[currentImageIdIndex]);
                        }
                    }
                } else {
                    if(currentImageIdIndex > 0) {
                        currentImageIdIndex--;
                        cornerstone.newStackImage(element, currentStack.imageIds[currentImageIdIndex]);
                    } else {
                        if(currentStackIndex > 0) {
                            currentStackIndex--;
                            currentStack = stacks[currentStackIndex];
                            currentImageIdIndex = currentStack.imageIds.length - 1;
                            cornerstoneTools.setElementToolStateManager(element, stackStateManagers[currentStackIndex]);
                            cornerstone.newStack(element, currentStack.imageIds[currentImageIdIndex]);
                        }

                    }
                }
                //prevent page fom scrolling
                return false;
            });
        }
        /*
        else {
            $(element).mousedown(function(e) {
                var lastX = e.pageX;
                var lastY = e.pageY;

                var mouseButton = e.which;

                if(mouseButton == whichMouseButton) {
                    $(document).mousemove(function(e) {
                        var deltaX = e.pageX - lastX,
                            deltaY = e.pageY - lastY ;
                        lastX = e.pageX;
                        lastY = e.pageY;

                        if(deltaY < 0) {
                            if(currentImageIdIndex < (imageIds.length - 1)) {
                                currentImageIdIndex++;
                                cornerstone.showImage(element, imageIds[currentImageIdIndex]);
                            }
                        } else if(deltaY > 0){
                            if(currentImageIdIndex > 0) {
                                currentImageIdIndex--;
                                cornerstone.showImage(element, imageIds[currentImageIdIndex]);
                            }
                        }
                    });

                    $(document).mouseup(function(e) {
                        $(document).unbind('mousemove');
                        $(document).unbind('mouseup');
                    });
                }
            });
        }
        */

    }

    // module/private exports
    cornerstoneTools.scroll = scroll;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, csc, cornerstoneTools) {

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    // This implements an Stack specific tool state management strategy.  This means
    // that tool data is shared between all imageIds in a given stack
    function newStackSpecificToolStateManager(toolTypes, oldStateManager) {
        var toolState = {};

        // here we add tool state, this is done by tools as well
        // as modules that restore saved state
        function addStackSpecificToolState(element, toolType, data)
        {
            // if this is a tool type to apply to the stack, do so
            if(toolTypes.indexOf(toolType) >= 0) {
                var enabledImage = cornerstone.getEnabledElement(element);

                // if we don't have tool state for this type of tool, add an empty object
                if(toolState.hasOwnProperty(toolType) == false)
                {
                    toolState[toolType] = {
                        data: []
                    };
                }
                var toolData = toolState[toolType];

                // finally, add this new tool to the state
                toolData.data.push(data);
            }
            else {
                // call the imageId specific tool state manager
                return oldStateManager.add(element, toolType, data);
            }
        };

        // here you can get state - used by tools as well as modules
        // that save state persistently
        function getStackSpecificToolState(element, toolType)
        {
            // if this is a tool type to apply to the stack, do so
            if(toolTypes.indexOf(toolType) >= 0) {
                // if we don't have tool state for this type of tool, add an empty object
                if(toolState.hasOwnProperty(toolType) == false)
                {
                    toolState[toolType] = {
                        data: []
                    };
                }
                var toolData = toolState[toolType];
                return toolData;
            }
            else
            {
                // call the imageId specific tool state manager
                return oldStateManager.get(element, toolType, data);
            }
        };

        var imageIdToolStateManager = {
            get: getStackSpecificToolState,
            add: addStackSpecificToolState
        };
        return imageIdToolStateManager;
    };

    // module/private exports
    cornerstoneTools.newStackSpecificToolStateManager = newStackSpecificToolStateManager;

    return cornerstoneTools;
}($, cornerstone, cornerstoneCore, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, csc, cornerstoneTools) {

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function getElementToolStateManager(element)
    {
        var enabledImage = cornerstone.getEnabledElement(element);
        // if the enabledImage has no toolStateManager, create a default one for it
        // NOTE: This makes state management element specific
        if(enabledImage.toolStateManager === undefined) {
            enabledImage.toolStateManager = cornerstoneTools.globalImageIdSpecificToolStateManager;
        }
        return enabledImage.toolStateManager;
    }

    // here we add tool state, this is done by tools as well
    // as modules that restore saved state
    function addToolState(element, toolType, data)
    {
        toolStateManager = getElementToolStateManager(element);
        toolStateManager.add(element, toolType, data);
        // TODO: figure out how to broadcast this change to all enabled elements so they can update the image
        // if this change effects them
    }

    // here you can get state - used by tools as well as modules
    // that save state persistently
    function getToolState(element, toolType)
    {
        toolStateManager = getElementToolStateManager(element);
        return toolStateManager.get(element, toolType);
    }

    // sets the tool state manager for an element
    function setElementToolStateManager(element, toolStateManager)
    {
        var enabledImage = cornerstone.getEnabledElement(element);
        enabledImage.toolStateManager = toolStateManager;
    }

    /*
    function getElementToolStateManager(element)
    {
        var enabledImage = cornerstone.getEnabledElement(element);
        return enabledImage.toolStateManager;
    }
    */

    // module/private exports
    cornerstoneTools.addToolState = addToolState;
    cornerstoneTools.getToolState = getToolState;
    cornerstoneTools.setElementToolStateManager = setElementToolStateManager;
    cornerstoneTools.getElementToolStateManager = getElementToolStateManager;

    return cornerstoneTools;
}($, cornerstone, cornerstoneCore, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function onMouseDown(e) {
        var whichMouseButton = e.data.whichMouseButton;
        var lastX = e.pageX;
        var lastY = e.pageY;

        var mouseButton = e.which;

        if(mouseButton == whichMouseButton) {

            var element = e.currentTarget;

            $(document).mousemove(function(e) {
                var deltaX = e.pageX - lastX;
                var deltaY = e.pageY - lastY;
                lastX = e.pageX;
                lastY = e.pageY;

                var viewport = cornerstone.getViewport(element);
                viewport.windowWidth += (deltaX / viewport.scale);
                viewport.windowCenter += (deltaY / viewport.scale);
                cornerstone.setViewport(element, viewport);
            });

            $(document).mouseup(function(e) {
                $(document).unbind('mousemove');
                $(document).unbind('mouseup');
            });
            e.stopPropagation();
        }
    }

    // enables the length tool on the specified element.  The length tool must first
    // be enabled before it can be activated.  Enabling it will allow it to display
    // any length measurements that already exist
    // NOTE: if we want to make this tool at all configurable, we can pass in an options object here
    function enable(element)
    {
        $(element).unbind('mousedown', onMouseDown);
    }

    // disables the length tool on the specified element.  This will cause existing
    // measurements to no longer be displayed.  You must re-enable the tool on an element
    // before you can activate it again.
    function disable(element)
    {
        $(element).unbind('mousedown', onMouseDown);
    }

    // hook the mousedown event so we can create a new measurement
    function activate(element, whichMouseButton)
    {
        $(element).unbind('mousedown', onMouseDown);
        var eventData = {
            whichMouseButton: whichMouseButton,
            active: true
        };
        $(element).mousedown(eventData, onMouseDown);
    }

    // rehook mousedown with a new eventData that says we are not active
    function deactivate(element)
    {
        $(element).unbind('mousedown', onMouseDown);
        // TODO: we currently assume that left mouse button is used to move measurements, this should
        // probably be configurable
        var eventData = {
            whichMouseButton: 1,
            active: false
        };
        $(element).mousedown(eventData, onMouseDown);
    }

    // module exports
    cornerstoneTools.wwwc = {
        enable: enable,
        disable : disable,
        activate: activate,
        deactivate: deactivate
    }

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }


    /*
    function zoom(element, whichMouseButton){

        if(whichMouseButton == 0) {


            $(element).on('mousewheel DOMMouseScroll', function(e) {

                var startingCoords = cornerstone.pageToImage(element, e.pageX, e.pageY);

                // Firefox e.originalEvent.detail > 0 scroll back, < 0 scroll forward
                // chrome/safari e.originalEvent.wheelDelta < 0 scroll back, > 0 scroll forward
                var ticks = 0;
                var delta = Math.abs(e.originalEvent.wheelDelta ? e.originalEvent.wheelDelta/40 : e.originalEvent.detail ? -e.originalEvent.detail : 0);
                if(e.originalEvent.wheelDelta < 0 || e.originalEvent.detail > 0)
                {
                    ticks = delta;
                } else {
                    ticks = -delta;
                }

                var power = 1.005;
                var viewport = cornerstone.getViewport(element);
                var oldFactor = Math.log(viewport.scale) / Math.log(power);
                var factor = oldFactor + ticks;
                var scale = Math.pow(power, factor);
                viewport.scale = scale;

                var ee = cornerstone.getEnabledElement(element);
                ee.viewport.scale = scale;

                // now adjust the centerX and Y
                var newCoords = cornerstone.pageToImage(element, e.pageX, e.pageY);
                viewport.centerX -= startingCoords.x - newCoords.x;
                viewport.centerY -= startingCoords.y - newCoords.y;
                cornerstone.setViewport(element, viewport);

                //prevent page fom scrolling
                return false;
            });
        }
        else {

        }

    }
    */

    function onMouseDown(e) {

        var eventData = e.data;
        var element = e.currentTarget
        if(e.which == eventData.whichMouseButton) {

            var lastX = e.pageX;
            var lastY = e.pageY;

            var startingCoords = cornerstone.pageToImage(element, e.pageX, e.pageY);
            var startPageX = e.pageX;
            var startPageY = e.pageY;
            $(document).mousemove(function(e) {
                var deltaX = e.pageX - lastX,
                    deltaY = e.pageY - lastY ;

                lastX = e.pageX;
                lastY = e.pageY;

                var pow = 1.7;

                var viewport = cornerstone.getViewport(element);
                var ticks = deltaY/100;
                var oldFactor = Math.log(viewport.scale) / Math.log(pow);
                var factor = oldFactor + ticks;
                var scale = Math.pow(pow, factor);
                viewport.scale = scale;

                var ee = cornerstone.getEnabledElement(element);
                ee.viewport.scale = scale;

                // now adjust the centerX and Y
                var newCoords = cornerstone.pageToImage(element, startPageX, startPageY);
                viewport.centerX -= startingCoords.x - newCoords.x;
                viewport.centerY -= startingCoords.y - newCoords.y;
                cornerstone.setViewport(element, viewport);

            });

            $(document).mouseup(function(e) {
                $(document).unbind('mousemove');
                $(document).unbind('mouseup');
            });
        }
    }

    // enables the length tool on the specified element.  The length tool must first
    // be enabled before it can be activated.  Enabling it will allow it to display
    // any length measurements that already exist
    // NOTE: if we want to make this tool at all configurable, we can pass in an options object here
    function enable(element)
    {
        $(element).unbind('mousedown', onMouseDown);
    }

    // disables the length tool on the specified element.  This will cause existing
    // measurements to no longer be displayed.  You must re-enable the tool on an element
    // before you can activate it again.
    function disable(element)
    {
        $(element).unbind('mousedown', onMouseDown);
    }

    // hook the mousedown event so we can create a new measurement
    function activate(element, whichMouseButton)
    {
        $(element).unbind('mousedown', onMouseDown);
        var eventData = {
            whichMouseButton: whichMouseButton,
            active: true
        };
        $(element).mousedown(eventData, onMouseDown);
    }

    // rehook mousedown with a new eventData that says we are not active
    function deactivate(element)
    {
        $(element).unbind('mousedown', onMouseDown);
        // TODO: we currently assume that left mouse button is used to move measurements, this should
        // probably be configurable
        var eventData = {
            whichMouseButton: 1,
            active: false
        };
        $(element).mousedown(eventData, onMouseDown);
    }

    // module exports
    cornerstoneTools.zoom = {
        enable: enable,
        disable : disable,
        activate: activate,
        deactivate: deactivate
    }

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));