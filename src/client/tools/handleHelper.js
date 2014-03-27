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