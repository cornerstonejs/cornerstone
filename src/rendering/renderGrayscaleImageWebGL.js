/**
 * This module is responsible for drawing a grayscale image
 */

(function (cornerstone) {

    "use strict";

    /**
     * API function to draw a grayscale image to a given enabledElement
     * @param enabledElement
     * @param invalidated - true if pixel data has been invalidated and cached rendering should not be used
     */
    function renderGrayscaleImageWebGL(enabledElement, invalidated) {

        cornerstone.rendering.webGLRenderer.render(enabledElement);

    }

    // Module exports
    cornerstone.rendering.grayscaleImageWebGL = renderGrayscaleImageWebGL;
    cornerstone.renderGrayscaleImageWebGL = renderGrayscaleImageWebGL;

}(cornerstone));
