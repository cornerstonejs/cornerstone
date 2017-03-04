var enabledElements = [];

export function getEnabledElement(element) {
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

export function addEnabledElement(enabledElement) {
    if(enabledElement === undefined) {
        throw "getEnabledElement: enabledElement element must not be undefined";
    }

    enabledElements.push(enabledElement);
}

export function getEnabledElementsByImageId(imageId) {
    var ees = [];
    enabledElements.forEach(function(enabledElement) {
        if(enabledElement.image && enabledElement.image.imageId === imageId) {
            ees.push(enabledElement);
        }
    });
    return ees;
}

export function getEnabledElements() {
    return enabledElements;
}
