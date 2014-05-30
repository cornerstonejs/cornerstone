var cornerstone = (function (cornerstone) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
    }

    var enabledElements = [];

    function getEnabledElement(element) {
        if(element === undefined) {
            throw "getEnabledElement: parameter element must not be undefined";
        }
        for(var i=0; i < enabledElements.length; i++) {
            if(enabledElements[i].element == element) {
                return enabledElements[i];
            }
        }

        throw "element not enabled";
    }

    function addEnabledElement(enabledElement) {
        if(enabledElement === undefined) {
            throw "getEnabledElement: enabledElement element must not be undefined";
        }

        enabledElements.push(enabledElement);
    }

    function disable(element) {
        if(element === undefined) {
            throw "disable: element element must not be undefined";
        }

        for(var i=0; i < enabledElements.length; i++) {
            if(enabledElements[i].element === element) {
                enabledElements[i].element.removeChild(enabledElements[i].canvas);
                enabledElements.splice(i, 1);
                return;
            }
        }
    }

    function getEnabledElementsByImageId(imageId) {
        var ees = [];
        enabledElements.forEach(function(enabledElement) {
            if(enabledElement.image && enabledElement.image.imageId === imageId) {
                ees.push(enabledElement);
            }
        });
        return ees;
    }


    // module/private exports
    cornerstone.getEnabledElement = getEnabledElement;
    cornerstone.addEnabledElement = addEnabledElement;
    cornerstone.disable = disable;
    cornerstone.getEnabledElementsByImageId = getEnabledElementsByImageId;

    return cornerstone;
}(cornerstone));