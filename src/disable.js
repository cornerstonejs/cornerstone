(function (cornerstone) {

    "use strict";

    function disable(element) {
        if(element === undefined) {
            throw "disable: element element must not be undefined";
        }

        // Search for this element in this list of enabled elements
        var enabledElements = cornerstone.getEnabledElements();
        for(var i=0; i < enabledElements.length; i++) {
            if(enabledElements[i].element === element) {
                // We found it!

                // Fire an event so dependencies can cleanup
                var eventData = {
                    element : element
                };
                $(element).trigger("CornerstoneElementDisabled", eventData);

                // remove the child dom elements that we created (e.g.canvas)
                enabledElements[i].element.removeChild(enabledElements[i].canvas);
                enabledElements[i].canvas = undefined;

                // remove this element from the list of enabled elements
                enabledElements.splice(i, 1);
                return;
            }
        }
    }

    // module/private exports
    cornerstone.disable = disable;

}(cornerstone));