var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

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
            $(element).mousedown(function(e) {
                var lastX = e.pageX;
                var lastY = e.pageY;

                var mouseButton = e.which;

                if(mouseButton == whichMouseButton) {

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
            });
        }

    }


    // module/private exports
    cornerstoneTools.zoom = zoom;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));