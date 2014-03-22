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
    };

    function getActiveHandle(handles) {
        for(var property in handles) {
            var handle = handles[property];
            if(handle.active === true) {
                return handle;
            }
        }
        return undefined;
    };

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
    };

    function handleCursorNearHandle(e, data, coords, scale) {

        if(data.visible === false) {
            return false;
        }

        var nearbyHandle = cornerstoneTools.findHandleNear(data.handles, coords, scale)
        if(nearbyHandle == undefined)
        {
            return false;
        }

        $(document).mousemove(function(e) {
            var coords = cornerstone.pageToImage(element, e.pageX, e.pageY);
            nearbyHandle.x = coords.x;
            nearbyHandle.y = coords.y;
            cornerstone.updateImage(element);
        });

        $(document).mouseup(function(e) {
            $(document).unbind('mousemove');
            $(document).unbind('mouseup');
        });

        return true;
    };

    function drawHandles(context, viewport, handles)
    {
        context.strokeStyle = 'white';
        context.lineWidth = 1 / viewport.scale;
        var radius = handleRadius / viewport.scale;
        for(var property in handles) {
            var handle = handles[property];
            if(handle.active == true) {
                context.arc(handle.x, handle.y, radius, 0, 2 * Math.PI);
            }
        }
    };

    // module/private exports
    cornerstoneTools.findHandleNear = findHandleNear;
    cornerstoneTools.handleCursorNearHandle = handleCursorNearHandle;
    cornerstoneTools.drawHandles = drawHandles;
    cornerstoneTools.activateNearbyHandle = activateNearbyHandle;

    return cornerstoneTools;
}($, cornerstone, cornerstoneCore, cornerstoneTools));