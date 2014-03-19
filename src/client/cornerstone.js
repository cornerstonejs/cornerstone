var cornerstone = (function (cornerstone, csc) {
    if(cornerstone === undefined) {
        cornerstone = {};
    }

    var enabledElements = [];

    var image108 = csc.image();
    var image109 = csc.image();

    window.onload = function() {
        cornerstone.enableAllElements();
        var ab = cornerstone.image108;
        var index = 0;
        for(var rows=0; rows < 256; rows++) {
            for(var columns=0; columns< 256; columns++) {
                image108.storedPixelData[index] = ab[index++];
            }
        }
        ab = cornerstone.image109;
        index = 0;
        for(rows=0; rows < 256; rows++) {
            for(columns=0; columns< 256; columns++) {
                image109.storedPixelData[index] = ab[index++];
            }
        }
        updateImage(enabledElements[0].element);

    };



    /*csc.readPixelData('../pixels108.raw', function(data) {
        var ab = cs.image108;
        var ab = new Uint16Array(data);
        var index = 0;
        for(var rows=0; rows < 256; rows++) {
            for(var columns=0; columns< 256; columns++) {
                image108.storedPixelData[index] = ab[index++];
            }
        }
        updateImage(enabledElements[0].element);
    });

    csc.readPixelData('../pixels109.raw', function(data) {
        var ab = new Uint16Array(data);
        var index = 0;
        for(var rows=0; rows < 256; rows++) {
            for(var columns=0; columns< 256; columns++) {
                image109.storedPixelData[index] = ab[index++];
            }
        }
        updateImage(enabledElements[0].element);
    });
    */

    function getEnabledElement(element) {
        for(var i=0; i < enabledElements.length; i++) {
            if(enabledElements[i].element == element) {
                return enabledElements[i];
            }
        }
        return undefined;
    };

    function updateImage(element) {
        var ee = getEnabledElement(element);
        var image = getImageForId(ee.ids.imageId);
        csc.drawImage(ee, image);
    };

    cornerstone.config = function () {
    };

    function getImageForId(imageId)
    {
        if(imageId == '1.3.12.2.1107.5.2.32.35020.2011062208172724415309288')
        {
            return image108;
        }
        else if(imageId == '1.3.12.2.1107.5.2.32.35020.2011062208172724415309289') {
            return image109;
        }
    }

    cornerstone.enable = function (element, studyId, imageId, viewportOptions) {
        var canvas = document.createElement('canvas');
        canvas.width = element.clientWidth;
        canvas.height = element.clientHeight;
        element.appendChild(canvas);

        var image = getImageForId(imageId);

        var viewport = {
            scale : 1.0,
            centerX : 0,//image.columns / 2,
            centerY: 0,//image.rows / 2,
            windowWidth: 256,
            windowCenter: 128
        };

        // fit image to window
        var verticalScale = canvas.height / image.rows;
        var horizontalScale = canvas.width / image.columns;
        if(verticalScale > horizontalScale) {
            viewport.scale = verticalScale;
        }
        else {
            viewport.scale = horizontalScale;
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
                studyId: studyId,
                imageId: imageId
            },
            image: {
                width: image.columns,
                height: image.rows
            },
            viewport : viewport
        };
        enabledElements.push(el);
        updateImage(element);
    };



    cornerstone.showImage = function (element, studyId, imageId, viewportOptions) {
        enabledElement = getEnabledElement(element);
        enabledElement.ids.studyId = studyId;
        enabledElement.ids.imageId = imageId;
        // merge
        if(viewportOptions) {
            for(var attrname in viewportOptions)
            {
                if(viewportOptions[attrname] !== null) {
                    enabledElement.viewport[attrname] = viewportOptions[attrname];
                }
            }
        }
        updateImage(element);
    };

    cornerstone.setViewport= function (element, viewport) {
        enabledElement = getEnabledElement(element);
        if(viewport.windowWidth < 1) {
            viewport.windowWidth = 1;
        }
        if(viewport.scale < 0.0001) {
            viewport.scale = .25;
        }
        enabledElement.viewport = viewport;
        updateImage(element);
    };

    cornerstone.getViewport= function (element) {
        return getEnabledElement(element).viewport;

    };

    return cornerstone;
}(cornerstone, cornerstoneCore));