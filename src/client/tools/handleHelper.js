var cornerstoneTools = (function ($, cornerstone, csc, cornerstoneTools) {

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var handleRadius = 3;
    var handleRadiusSquared = handleRadius * handleRadius;

    function findHandleNear(handles, imagePoint)
    {
        for(var property in handles) {
            var handle = handles[property];
            var distanceSquared = csc.distanceSquared(imagePoint, handle);
            if(distanceSquared <= handleRadiusSquared)
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

    function activateNearbyHandle(handles, imagePoint)
    {
        var activeHandle = getActiveHandle(handles);
        var nearbyHandle = findHandleNear(handles, imagePoint);
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

    function handleCursorNearHandle(e, data, coords) {

        if(data.visible === false) {
            return false;
        }

        var nearbyHandle = cornerstoneTools.findHandleNear(data.handles, coords)
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

    function drawHandles(context, handles)
    {
        for(var property in handles) {
            var handle = handles[property];
            if(handle.active == true) {
                context.arc(handle.x, handle.y, handleRadius, 0, 2 * Math.PI);
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