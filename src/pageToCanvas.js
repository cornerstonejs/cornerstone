(function(cornerstone) {

    "use strict";

    /**
     * Converts a point in the page coordinate system to the canvas coordinate system.
     * This can be used in tools to compare handle/tool and mouse pointer distance
     * regardless of image resolution/zoom.
     * @param element
     * @param pt
     * @returns {x: number, y: number}
     */
    function pageToCanvas(element, pt) {
        var rect = element.getBoundingClientRect();
        return {
            x: pt.x - rect.left - window.pageXOffset,
            y: pt.y - rect.top - window.pageYOffset,
        };
    }

    // module/private exports
    cornerstone.pageToCanvas = pageToCanvas;

}(cornerstone));