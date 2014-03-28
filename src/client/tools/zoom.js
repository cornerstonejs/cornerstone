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