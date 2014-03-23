var cornerstone = (function (cornerstone, csc) {
    if(cornerstone === undefined) {
        cornerstone = {};
    }

    function enable(element, imageId, viewportOptions) {
        var canvas = document.createElement('canvas');
        canvas.width = element.clientWidth;
        canvas.height = element.clientHeight;
        element.appendChild(canvas);

        var image = cornerstone.loadImage(imageId);

        var viewport = {
            scale : 1.0,
            centerX : 0,
            centerY: 0,
            windowWidth: image.windowWidth,
            windowCenter: image.windowCenter
        };

        // fit image to window
        var verticalScale = canvas.height / image.rows;
        var horizontalScale= canvas.width / image.columns;
        if(horizontalScale < verticalScale) {
            viewport.scale = horizontalScale;
        }
        else {
            viewport.scale = verticalScale;
        }
        // merge
        if(viewportOptions) {
            for(var attrname in viewportOptions)
            {
                if(viewportOptions[attrname] !== null) {
                    viewport[attrname] = viewportOptions[attrname];
                }
            }
        }

        var el = {
            element: element,
            canvas: canvas,
            ids : {
                imageId: imageId
            },
            image:image,
            viewport : viewport,
            data : {}
        };
        cornerstone.addEnabledElement(el);
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

    };


    // module/private exports
    cornerstone.enable = enable;

    return cornerstone;
}(cornerstone, cornerstoneCore));