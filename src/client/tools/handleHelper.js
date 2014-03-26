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

        return handleHandle(e, nearbyHandle);

    };

    function handleHandle(e, handle)
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

    function moveAllHandles(e, data)
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