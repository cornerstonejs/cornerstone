var cornerstone = (function (cornerstone, csc) {
    if(cornerstone === undefined) {
        cornerstone = {};
    }

    function enable(element, imageId, viewportOptions) {
        var canvas = document.createElement('canvas');
        // Set the size of canvas and take retina into account
        var retina = window.devicePixelRatio > 1;
        if(retina) {
            canvas.width = element.clientWidth * 2;
            canvas.height = element.clientHeight * 2;
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

            var event = new CustomEvent(
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
}(cornerstone, cornerstoneCore));