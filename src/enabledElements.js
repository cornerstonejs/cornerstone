var cornerstone = (function (cornerstone) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
    }

    var enabledElements = [];

    function getEnabledElement(element) {
        for(var i=0; i < enabledElements.length; i++) {
            if(enabledElements[i].element == element) {
                return enabledElements[i];
            }
        }
        return undefined;
    }

    function addEnabledElement(el) {
        enabledElements.push(el);
    }

    function removeEnabledElement(element) {
        for(var i=0; i < enabledElements.length; i++) {
            if(enabledElements[i].element === element) {
                enabledElements[i].element.removeChild(enabledElements[i].canvas);
                enabledElements.splice(i, 1);
                return;
            }
        }
    }

    // module/private exports
    cornerstone.getEnabledElement = getEnabledElement;
    cornerstone.addEnabledElement = addEnabledElement;
    cornerstone.removeEnabledElement = removeEnabledElement ;

    return cornerstone;
}(cornerstone));