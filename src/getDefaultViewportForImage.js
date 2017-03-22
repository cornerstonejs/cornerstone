/**
 * This file is responsible for returning the default viewport for an image
 */

(function (cornerstone) {

    "use strict";

    /**
     * returns a default viewport for display the specified image on the specified
     * enabled element.  The default viewport is fit to window
     *
     * @param element
     * @param image
     */
    function getDefaultViewportForImage(element, image) {
        var enabledElement = cornerstone.getEnabledElement(element);
        var viewport = cornerstone.internal.getDefaultViewport(enabledElement.canvas, image);
        return viewport;
    }

    // Module exports
    cornerstone.getDefaultViewportForImage = getDefaultViewportForImage;
}(cornerstone));
