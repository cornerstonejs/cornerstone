(function (cornerstone) {

    "use strict";

    /**
     * Converts a point in the pixel coordinate system to the canvas coordinate system
     * system.  This can be used to render using canvas context without having the weird
     * side effects that come from scaling and non square pixels
     * @param element
     * @param pt
     * @returns {x: number, y: number}
     */
    function pixelToCanvas(element, pt) {
        var enabledElement = cornerstone.getEnabledElement(element);
        var transform = cornerstone.internal.getTransform(enabledElement);
        return transform.transformPoint(pt.x, pt.y);
    }

    // module/private exports
    cornerstone.pixelToCanvas = pixelToCanvas;

}(cornerstone));
