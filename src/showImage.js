/**
 * This module contains functions that deal with changing the image displays in an enabled element
 */
var cornerstone = (function (cornerstone) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
    }

    /**
     * This function changes the image while preserving viewport settings.  This is appropriate
     * when changing to a different image in the same stack/series
     * @param element
     * @param imageId
     * @param viewportOptions
     */
    function showImage(element, imageId, viewportOptions) {
        var enabledElement = cornerstone.getEnabledElement(element);
        enabledElement.ids.imageId = imageId;
        var loadImageDeferred = cornerstone.loadImage(imageId);

        loadImageDeferred.done(function(image) {
            enabledElement.image = image;

            // merge
            if(viewportOptions) {
                for(var attrname in viewportOptions)
                {
                    if(viewportOptions[attrname] !== null) {
                        enabledElement.viewport[attrname] = viewportOptions[attrname];
                    }
                }
            }
            cornerstone.updateImage(element);

            var event = new CustomEvent(
                "CornerstoneNewImage",
                {
                    detail: {
                        viewport: enabledElement.viewport,
                        element: element,
                        image: enabledElement.image

                    },
                    bubbles: false,
                    cancelable: false
                }
            );
            element.dispatchEvent(event);

        });
    }

    // module exports
    cornerstone.showImage = showImage;
    return cornerstone;
}(cornerstone));