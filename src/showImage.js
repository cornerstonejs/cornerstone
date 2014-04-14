/**
 * This module contains functions that deal with changing the image displays in an enabled element
 */
var cornerstone = (function (cornerstone) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
    }

    /**
     * This function changes the imageId displayed in the enabled element and applies the properties
     * in viewport.  If viewport is not supplied, the default viewport is used.
     * @param element
     * @param imageId
     * @param viewport
     */
    function showImage(element, imageId, viewport) {
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
                    //console.log('removing ' + numToRemove + " stale entries from imageIdHistory, " + (enabledElement.imageIdHistory.length - numToRemove) + " remaining");
                    enabledElement.imageIdHistory.splice(i, numToRemove );

                    enabledElement.image = image;

                    if(enabledElement.viewport === undefined) {
                        enabledElement.viewport = cornerstone.getDefaultViewport(enabledElement.canvas, image);
                    }

                    enabledElement.viewport = cornerstone.getDefaultViewport(enabledElement.canvas, image);

                    // merge
                    if(viewport) {
                        for(var attrname in viewport)
                        {
                            if(viewport[attrname] !== null) {
                                enabledElement.viewport[attrname] = viewport[attrname];
                            }
                        }
                    }

                    cornerstone.updateImage(element);

                    cornerstone.event(enabledElement, "CornerstoneViewportUpdated");
                    cornerstone.event(enabledElement, "CornerstoneNewImage");

                    return;
                }
            }
        });
    }

    // module exports
    cornerstone.showImage = showImage;
    return cornerstone;
}(cornerstone));