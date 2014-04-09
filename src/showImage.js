var cornerstone = (function (cornerstone) {

    "use strict";


    if(cornerstone === undefined) {
        cornerstone = {};
    }

    // Shows a new image in the existing stack
    function newStackImage(element, imageId, viewportOptions)
    {
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

    // shows a new stack
    function newStack(element, imageId, viewportOptions)
    {
        var enabledElement = cornerstone.getEnabledElement(element);
        enabledElement.ids.imageId = imageId;
        var loadImageDeferred = cornerstone.loadImage(imageId);

        loadImageDeferred.done(function(image) {
            enabledElement.image = image;

            enabledElement.viewport = cornerstone.resetViewport(enabledElement.element, enabledElement.canvas, enabledElement.image);

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

    // This function changes the image while preserving viewport settings.  This is appropriate
    // when changing to a different image in the same stack/series
    cornerstone.showImage = function (element, imageId, viewportOptions) {
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
    };

    // this function completely replaces an image with a new one losing all tool state
    // and viewport settings.  This is appropriate when changing to an image that is not part
    // of the same stack
    cornerstone.replaceImage = function(element, imageId, viewportOptions)
    {
        cornerstone.removeEnabledElement(element);
        cornerstone.enable(element, imageId, viewportOptions);
    };

    cornerstone.newStackImage = newStackImage;
    cornerstone.newStack = newStack;
    return cornerstone;
}(cornerstone));