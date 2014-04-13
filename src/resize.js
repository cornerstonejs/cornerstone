/**
 * This module is responsible for enabling an element to display images with cornerstone
 */
var cornerstone = (function (cornerstone) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
    }

    function setCanvasSize(element, canvas)
    {
        // the device pixel ratio is 1.0 for normal displays and > 1.0
        // for high DPI displays like Retina
        var devicePixelRatio = window.devicePixelRatio;
        if(devicePixelRatio === undefined) {
            devicePixelRatio = 1.0;
        }

        canvas.width = element.clientWidth * devicePixelRatio;
        canvas.height = element.clientHeight * devicePixelRatio;
        canvas.style.width = element.clientWidth + "px";
        canvas.style.height = element.clientHeight + "px";
    }

    /**
     * resizes an enabled element and optionally fits the image to window
     * @param element
     * @param fitToWindow
     */
    function resize(element, fitToWindow) {

        var enabledElement = cornerstone.getEnabledElement(element);

        setCanvasSize(element, enabledElement.canvas);

        if(enabledElement.image !== undefined ) {
            if(fitToWindow === true) {
                cornerstone.fitToWindow(element);
            }
            else {
                cornerstone.updateImage(element);
            }
        }
    }

    // module/private exports
    cornerstone.resize = resize;

    return cornerstone;
}(cornerstone));