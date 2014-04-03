var cornerstone = (function (cornerstone, csc) {
    if(cornerstone === undefined) {
        cornerstone = {};
    }

    function enable(element, imageId, viewportOptions) {
        var canvas = document.createElement('canvas');
        canvas.width = element.clientWidth;
        canvas.height = element.clientHeight;
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
            var viewport = cornerstone.resetViewport(element, canvas, image);

            // merge viewportOptions into this viewport
            if(viewportOptions) {
                for(var property in viewport)
                {
                    if(viewportOptions[property] !== null) {
                        viewport[property] = viewportOptions[property];
                    }
                }
            }

            /*var el = {
                element: element,
                canvas: canvas,
                ids : {
                    imageId: imageId
                },
                image:image,
                viewport : viewport,
                data : {}
            };
            */
            //var el = cornerstone.getEnabledElement(el);
            el.image = image;
            el.viewport = viewport;
            cornerstone.updateImage(element);

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
        });
    }


    // module/private exports
    cornerstone.enable = enable;

    return cornerstone;
}(cornerstone, cornerstoneCore));