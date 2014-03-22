var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    // TODO: make a generic data storage mechanism for elements that
    //       gets cleaned up when the element is destroyed
    var lengthData = {};

    var handleRadius = 3;
    var handleRadiusSquared = handleRadius * handleRadius;

    function distanceSquared(point1, point2)
    {
        var dx = point1.x - point2.x;
        var dy = point1.y - point2.y;
        var lengthSquared = dx * dx + dy * dy;
        return lengthSquared;
    }

    function handleCursorNearHandle(e, data, coords) {

        if(data.lengthVisible === false) {
            return false;
        }
        var startDistanceSquared = distanceSquared({x: data.startX, y: data.startY}, coords);
        var endDistanceSquared = distanceSquared({x: data.endX, y: data.endY}, coords);

        if(startDistanceSquared > handleRadiusSquared && endDistanceSquared > handleRadiusSquared) {
            return false;
        }

        $(document).mousemove(function(e) {
            var coords = cornerstone.pageToImage(element, e.pageX, e.pageY);
            if(startDistanceSquared <= handleRadius) {
                data.startX = coords.x;
                data.startY = coords.y;
            }
            else
            {
                data.endX = coords.x;
                data.endY = coords.y;
            }
            cornerstone.updateImage(element);
        });

        $(document).mouseup(function(e) {
            $(document).unbind('mousemove');
            $(document).unbind('mouseup');
        });

        return true;
    }



    function onMouseDown(e) {
        var element = e.currentTarget;
        var data = lengthData[element];
        if(e.which == data.whichMouseButton) {
            var coords = cornerstone.pageToImage(element, e.pageX, e.pageY);

            // if we have a visible length measurement, check to see if this point
            // is near one of its handles
            if(handleCursorNearHandle(e, data, coords) == true) {
                e.stopPropagation();
                return;
            }

            data.startX = coords.x;
            data.startY = coords.y;
            data.endX = coords.x;
            data.endY = coords.y;
            data.lengthVisible = true;

            $(document).mousemove(function(e) {
                var coords = cornerstone.pageToImage(element, e.pageX, e.pageY);
                data.endX = coords.x;
                data.endY = coords.y;
                cornerstone.updateImage(element);
            });

            $(document).mouseup(function(e) {
                $(document).unbind('mousemove');
                $(document).unbind('mouseup');
            });
        }
    };

    function onImageRendered(e)
    {
        var data = lengthData[e.detail.element];

        if(data.lengthVisible == false)
        {
            return;
        }

        var context = e.detail.canvasContext;
        context.beginPath();
        context.strokeStyle = 'white';
        context.lineWidth = 1;
        context.moveTo(data.startX, data.startY);
        context.lineTo(data.endX, data.endY);
        context.stroke();
        context.beginPath();
        context.strokeStyle = 'white';
        context.lineWidth = 0;
        if(data.cursorNearEnd == true) {
            context.arc(data.endX, data.endY, handleRadius, 0, 2 * Math.PI);
            //context.rect(data.endX-handleRadius, data.endY - handleRadius, handleRadius * 2, handleRadius *2);
        }
        if(data.cursorNearStart == true) {
            context.arc(data.startX, data.startY, handleRadius, 0, 2 * Math.PI);
            //context.rect(data.startX-handleRadius, data.startY - handleRadius, handleRadius * 2, handleRadius *2);
        }
        context.stroke();
        context.fillStyle = "white";
        context.font = e.detail.mediumFontSize + " Arial";
        var dx = data.startX - data.endX * e.detail.image.columnPixelSpacing;
        var dy = data.startY - data.endY * e.detail.image.rowPixelSpacing;
        var length = Math.sqrt(dx * dx + dy * dy);
        var text = "" + length.toFixed(2) + " mm";
        context.fillText(text, (data.startX + data.endX) / 2, (data.startY + data.endY) / 2);
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

        // Check to see if mouse is over the length measurement and highlight it if it is
        var startDistanceSquared = distanceSquared({x: data.startX, y: data.startY}, coords);
        var handleVisible = data.cursorNearEnd | data.cursorNearStart;
        data.cursorNearStart = false;
        data.cursorNearEnd = false;
        if(startDistanceSquared <= handleRadius) {
            data.cursorNearStart = true;
            cornerstone.updateImage(element);
            return;
        }
        var endDistanceSquared = distanceSquared({x: data.endX, y: data.endY}, coords);
        if(endDistanceSquared <= handleRadius) {
            data.cursorNearEnd = true;
            cornerstone.updateImage(element);
            return;
        }
        if(handleVisible == true) {
            cornerstone.updateImage(element);
        }

    };

    function enableLength(element, whichMouseButton)
    {
        element.addEventListener("CornerstoneImageRendered", onImageRendered, false);

        var eventData =
        {
            whichMouseButton: whichMouseButton,
            lengthVisible : false,
            startX : 0,
            startY : 0,
            endX : 0,
            endY : 0,
            cursorNearStart: false,
            cursorNearEnd: false
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
}($, cornerstone, cornerstoneTools));