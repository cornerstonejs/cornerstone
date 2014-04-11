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
        enabledElement.imageIdHistory.unshift(imageId);
        var loadImageDeferred = cornerstone.loadImage(imageId);
        loadImageDeferred.done(function(image) {
            // scan through the imageIdHistory to see if this imageId should be displayed
            for(var i=0; i < enabledElement.imageIdHistory.length; i++)
            {
                if(enabledElement.imageIdHistory[i] === image.imageId) {
                    enabledElement.imageId = imageId;
                    // remove all imageId's after this one
                    var numToRemove = enabledElement.imageIdHistory.length - i;
                    console.log('removing ' + numToRemove + " stale entries from imageIdHistory, " + (enabledElement.imageIdHistory.length - numToRemove) + " remaining");
                    enabledElement.imageIdHistory.splice(i, numToRemove );

                    enabledElement.image = image;

                    if(enabledElement.viewport === undefined) {
                        enabledElement.viewport = cornerstone.getDefaultViewport(enabledElement.canvas, image);
                    }

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

                    // fire an event indicating the viewport has been changed
                    var event = new CustomEvent(
                        "CornerstoneViewportUpdated",
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

                    event = new CustomEvent(
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
                    return;
                }
            }
        });
    }

    // module exports
    cornerstone.showImage = showImage;
    return cornerstone;
}(cornerstone));