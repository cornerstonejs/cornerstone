/**
 * This module is responsible for drawing a grayscale image
 */

(function (cornerstone) {

    "use strict";

    var lastRenderedImageId;
    var lastRenderedViewport = {};

/*
    function doesImageNeedToBeRendered(enabledElement, image) {
        if (image.imageId !== lastRenderedImageId ||
            lastRenderedViewport.windowCenter !== enabledElement.viewport.voi.windowCenter ||
            lastRenderedViewport.windowWidth !== enabledElement.viewport.voi.windowWidth ||
            lastRenderedViewport.invert !== enabledElement.viewport.invert ||
            lastRenderedViewport.rotation !== enabledElement.viewport.rotation ||
            lastRenderedViewport.hflip !== enabledElement.viewport.hflip ||
            lastRenderedViewport.vflip !== enabledElement.viewport.vflip
            ) {
            return true;
        }
        return false;
    }

    function getWebGLContext(enabledElement, image, invalidated) {
        // apply the lut to the stored pixel data onto the render canvas
        if (doesImageNeedToBeRendered(enabledElement, image) || invalidated) {
            initializeWebGLContext(enabledElement);
        }
        return gl;
    }
*/
    /**
     * API function to draw a grayscale image to a given enabledElement
     * @param enabledElement
     * @param invalidated - true if pixel data has been invaldiated and cached rendering should not be used
     */
    function renderColorImageWebGL(enabledElement, invalidated) {

        console.log("ASDASDF");
        cornerstone.rendering.webGLRenderer.render(enabledElement);

    }

    // Module exports
    cornerstone.rendering.grayscaleImageWebGL = renderColorImageWebGL;
    cornerstone.renderColorImageWebGL = renderColorImageWebGL;

}(cornerstone));
