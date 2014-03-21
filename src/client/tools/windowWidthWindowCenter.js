var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function windowWidthWindowCenter(element, whichMouseButton){
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
        });
    }


    // module/private exports
    cornerstoneTools.windowWidthWindowCenter = windowWidthWindowCenter;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));