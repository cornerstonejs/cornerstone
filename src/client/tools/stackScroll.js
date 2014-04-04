var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function onMouseWheel(e) {
        var eventData = e.data;
        var currentStack = eventData.stack;
        var element = e.currentTarget;
        // Firefox e.originalEvent.detail > 0 scroll back, < 0 scroll forward
        // chrome/safari e.originalEvent.wheelDelta < 0 scroll back, > 0 scroll forward
        if(e.originalEvent.wheelDelta < 0 || e.originalEvent.detail > 0) {
            if(eventData.currentImageIdIndex < (currentStack.imageIds.length - 1)) {
                eventData.currentImageIdIndex++;
                cornerstone.newStackImage(element, currentStack.imageIds[eventData.currentImageIdIndex]);
            }
        } else {
            if(eventData.currentImageIdIndex > 0) {
                eventData.currentImageIdIndex--;
                cornerstone.newStackImage(element, currentStack.imageIds[eventData.currentImageIdIndex]);
            }
        }
        //prevent page fom scrolling
        return false;
    }

    function enableStackScroll(element, stack, whichMouseButton){
        var stackStateManagers = [];

        var eventData = {
            whichMouseButton: 1,
            active: false,
            stack: stack,
            currentImageIdIndex : 0
        };


        var oldStateManager = cornerstoneTools.getElementToolStateManager(element);
        if(oldStateManager === undefined) {
            oldStateManager = cornerstoneTools.globalImageIdSpecificToolStateManager;
        }

        var stackTools = [];//'length'];
        var stackSpecificStateManager = cornerstoneTools.newStackSpecificToolStateManager(stackTools, oldStateManager);
        stackStateManagers.push(stackSpecificStateManager);

        cornerstoneTools.setElementToolStateManager(element, stackStateManagers[0]);

        if(whichMouseButton == 0) {
            $(element).on('mousewheel DOMMouseScroll', eventData, onMouseWheel);
        }
    }

    function disableStackScroll(element) {
        $(element).unbind('mousewheel DOMMouseScroll', onMouseWheel);
    }

    // module/private exports
    cornerstoneTools.stackScroll = {
        enable: enableStackScroll,
        disable: disableStackScroll
    };

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));