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
        }
    };

    function windowWidthWindowCenter(element, whichMouseButton){
        var eventData =
        {
            whichMouseButton: whichMouseButton
        };
        $(element).mousedown(eventData, onMouseDown);
    }

    function disableWindowWidthWindowCenter(element){
        $(element).unbind('mousedown', onMouseDown);
    }


    // module/private exports
    cornerstoneTools.windowWidthWindowCenter = windowWidthWindowCenter;
    cornerstoneTools.disableWindowWidthWindowCenter = disableWindowWidthWindowCenter;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));