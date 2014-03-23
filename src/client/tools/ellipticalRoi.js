var cornerstoneTools = (function ($, cornerstone, csc, cornerstoneTools) {

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function onMouseDown(e) {
        var element = e.currentTarget;
        var data = cornerstone.getElementData(element, 'ellipticalRoi');
        if(e.which == data.whichMouseButton) {
            var coords = cornerstone.pageToImage(element, e.pageX, e.pageY);
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


    function onImageRendered(e)
    {

        var data = cornerstone.getElementData(e.currentTarget, 'ellipticalRoi');

        if(data.lengthVisible == false)
        {
            return;
        }

        csc.setToPixelCoordinateSystem(e.detail.enabledElement, e.detail.canvasContext);

        var width = Math.abs(data.startX - data.endX);
        var height = Math.abs(data.startY - data.endY);
        var left = Math.min(data.startX, data.endX);
        var top = Math.min(data.startY, data.endY);
        var centerX = (data.startX + data.endX) / 2;
        var centerY = (data.startY + data.endY) / 2;

        var context = e.detail.canvasContext;
        context.beginPath();
        context.strokeStyle = 'white';
        context.lineWidth = 1 / e.detail.viewport.scale;
        context.beginPath();
        csc.drawEllipse(context, left, top, width, height);
        context.stroke();
        context.fillStyle = "white";

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

        var fontParameters = csc.setToFontCoordinateSystem(e.detail.enabledElement, e.detail.canvasContext, 15);
        context.font = "" + fontParameters.fontSize + "px Arial";

        var textSize = context.measureText(area);

        var offset = fontParameters.lineHeight;
        var textX  = centerX < (e.detail.image.columns / 2) ? centerX + (width /2): centerX - (width/2) - textSize.width * fontParameters.fontScale;
        var textY  = centerY < (e.detail.image.rows / 2) ? centerY + (height /2): centerY - (height/2);

        textX /= fontParameters.fontScale;
        textY /= fontParameters.fontScale;

        context.fillText("Mean: " + meanStdDev.mean.toFixed(2), textX, textY - offset);
        context.fillText("StdDev: " + meanStdDev.stdDev.toFixed(2), textX, textY);
        context.fillText(areaText, textX, textY + offset);
    };

    function enableEllipticalRoi(element, whichMouseButton)
    {
        element.addEventListener("CornerstoneImageRendered", onImageRendered, false);

        var eventData =
        {
            whichMouseButton: whichMouseButton,
            lengthVisible : false,
            startX : 0,
            startY : 0,
            endX : 0,
            endY : 0
        };

        var data = cornerstone.getElementData(element, 'ellipticalRoi');
        for(var attrname in eventData)
        {
            data[attrname] = eventData[attrname];
        }

        $(element).mousedown(onMouseDown);
    };

    function disableEllipticalRoi(element)
    {
        element.removeEventListener("CornerstoneImageRendered", onImageRendered);
        $(element).unbind('mousedown', onMouseDown);
        cornerstone.removeElementData(element, 'ellipticalRoi');
    };

    // module/private exports
    cornerstoneTools.enableEllipticalRoi = enableEllipticalRoi;
    cornerstoneTools.disableEllipticalRoi = disableEllipticalRoi;

    return cornerstoneTools;
}($, cornerstone, cornerstoneCore, cornerstoneTools));