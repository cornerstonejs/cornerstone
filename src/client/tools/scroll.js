var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function scroll(element, stacks, whichMouseButton){
        var currentImageIdIndex = 0;
        var currentStackIndex = 0;
        var stackStateManagers = [];

        var oldStateManager = cornerstoneTools.getElementToolStateManager(element);
        if(oldStateManager === undefined) {
            oldStateManager = cornerstoneTools.globalImageIdSpecificToolStateManager;
        }

        var stackTools = [];//'length'];
        stacks.forEach(function(stack) {
            var stackSpecificStateManager = cornerstoneTools.newStackSpecificToolStateManager(stackTools, oldStateManager);
            stackStateManagers.push(stackSpecificStateManager);
        });

        cornerstoneTools.setElementToolStateManager(element, stackStateManagers[0]);

        if(whichMouseButton == 0) {
            $(element).on('mousewheel DOMMouseScroll', function(e) {
                var currentStack = stacks[currentStackIndex];
                // Firefox e.originalEvent.detail > 0 scroll back, < 0 scroll forward
                // chrome/safari e.originalEvent.wheelDelta < 0 scroll back, > 0 scroll forward
                if(e.originalEvent.wheelDelta < 0 || e.originalEvent.detail > 0) {
                    if(currentImageIdIndex < (currentStack.imageIds.length - 1)) {
                        currentImageIdIndex++;
                        cornerstone.newStackImage(element, currentStack.imageIds[currentImageIdIndex]);
                    }
                    else {
                        if(currentStackIndex < stacks.length - 1) {
                            currentStackIndex++;
                            currentStack = stacks[currentStackIndex];
                            currentImageIdIndex = 0;
                            cornerstoneTools.setElementToolStateManager(element, stackStateManagers[currentStackIndex]);
                            cornerstone.newStack(element, currentStack.imageIds[currentImageIdIndex]);
                        }
                    }
                } else {
                    if(currentImageIdIndex > 0) {
                        currentImageIdIndex--;
                        cornerstone.newStackImage(element, currentStack.imageIds[currentImageIdIndex]);
                    } else {
                        if(currentStackIndex > 0) {
                            currentStackIndex--;
                            currentStack = stacks[currentStackIndex];
                            currentImageIdIndex = currentStack.imageIds.length - 1;
                            cornerstoneTools.setElementToolStateManager(element, stackStateManagers[currentStackIndex]);
                            cornerstone.newStack(element, currentStack.imageIds[currentImageIdIndex]);
                        }

                    }
                }
                //prevent page fom scrolling
                return false;
            });
        }
        /*
        else {
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

                        if(deltaY < 0) {
                            if(currentImageIdIndex < (imageIds.length - 1)) {
                                currentImageIdIndex++;
                                cornerstone.showImage(element, imageIds[currentImageIdIndex]);
                            }
                        } else if(deltaY > 0){
                            if(currentImageIdIndex > 0) {
                                currentImageIdIndex--;
                                cornerstone.showImage(element, imageIds[currentImageIdIndex]);
                            }
                        }
                    });

                    $(document).mouseup(function(e) {
                        $(document).unbind('mousemove');
                        $(document).unbind('mouseup');
                    });
                }
            });
        }
        */

    }

    // module/private exports
    cornerstoneTools.scroll = scroll;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));