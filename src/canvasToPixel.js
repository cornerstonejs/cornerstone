(function (cornerstone) {

    "use strict";

    /**
     * Converts a point in the canvas coordinate system to the pixel coordinate system
     * system.  This can be used to reset tools' image coordinates after modifications
     * have been made in canvas space (e.g. moving a tool by a few cm, independent of 
     * image resolution).
     *
     * @param element
     * @param pt
     * @returns {x: number, y: number}
     */
    function canvasToPixel(element, pt) {
        var enabledElement = cornerstone.getEnabledElement(element);
        var transform = cornerstone.internal.getTransform(enabledElement);
        transform.invert();
        return transform.transformPoint(pt.x, pt.y);
    }

    // module/private exports
    cornerstone.canvasToPixel = canvasToPixel;

}(cornerstone));
