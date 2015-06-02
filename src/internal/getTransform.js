(function (cornerstone) {

    "use strict";

    function getTransform(enabledElement)
    {
        // For now we will calculate it every time it is requested.  In the future, we may want to cache
        // it in the enabled element to speed things up
        var transform = cornerstone.internal.calculateTransform(enabledElement);
        return transform;
    }

    // Module exports
    cornerstone.internal.getTransform = getTransform;

}(cornerstone));