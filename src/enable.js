/**
 * This module is responsible for enabling an element to display images with cornerstone
 */
var cornerstone = (function (cornerstone) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
    }

    function enable(element, imageId, viewportOptions) {
        var canvas = document.createElement('canvas');

        // Set the size of canvas and take retina into account
        var retina = window.devicePixelRatio > 1;
        if(retina) {
            canvas.width = element.clientWidth * window.devicePixelRatio;
            canvas.height = element.clientHeight * window.devicePixelRatio;
            canvas.style.width = element.clientWidth + "px";
            canvas.style.height = element.clientHeight + "px";
        }
        else
        {
            canvas.width = element.clientWidth;
            canvas.height = element.clientHeight;
            canvas.style.width = element.clientWidth + "px";
            canvas.style.height = element.clientHeight + "px";
        }

        element.appendChild(canvas);

        var el = {
            element: element,
            canvas: canvas,
            ids : {
                imageId: imageId
            },
            data : {}
        };
        cornerstone.addEnabledElement(el);


        var loadImageDeferred = cornerstone.loadImage(imageId);
        loadImageDeferred.then(function(image){
            var viewport = cornerstone.getDefaultViewport(canvas, image);

            // merge viewportOptions into this viewport
            if(viewportOptions) {
                for(var property in viewport)
                {
                    if(viewportOptions[property] !== null) {
                        viewport[property] = viewportOptions[property];
                    }
                }
            }

            el.image = image;
            el.viewport = viewport;
            cornerstone.updateImage(element);

            // fire an event indicating the viewport has been changed
            var event = new CustomEvent(
                "CornerstoneViewportUpdated",
                {
                    detail: {
                        viewport: viewport,
                        element: element,
                    },
                    bubbles: false,
                    cancelable: false
                }
            );
            element.dispatchEvent(event);

            // Fire an event indicating a new image has been loaded
            event = new CustomEvent(
                "CornerstoneNewImage",
                {
                    detail: {
                        viewport: viewport,
                        element: element,
                        image: image

                    },
                    bubbles: false,
                    cancelable: false
                }
            );
            element.dispatchEvent(event);
        });

    }


    // module/private exports
    cornerstone.enable = enable;

    return cornerstone;
}(cornerstone));