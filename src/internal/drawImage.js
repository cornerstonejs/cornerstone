/**
 * This module is responsible for drawing an image to an enabled elements canvas element
 */

(function ($, cornerstone) {

    "use strict";

    /**
     * Internal API function to draw an image to a given enabled element
     * @param enabledElement
     * @param invalidated - true if pixel data has been invalidated and cached rendering should not be used
     */
    function drawImage(enabledElement, invalidated) {

        var start = new Date();

        enabledElement.image.render(enabledElement, invalidated);

        var context = enabledElement.canvas.getContext('2d');

        var end = new Date();
        var diff = end - start;
        //console.log(diff + ' ms');

        var eventData = {
            viewport : enabledElement.viewport,
            element : enabledElement.element,
            image : enabledElement.image,
            enabledElement : enabledElement,
            canvasContext: context,
            renderTimeInMs : diff
        };

        $(enabledElement.element).trigger("CornerstoneImageRendered", eventData);
        enabledElement.invalid = false;
    }

    // Module exports
    cornerstone.internal.drawImage = drawImage;
    cornerstone.drawImage = drawImage;

}($, cornerstone));