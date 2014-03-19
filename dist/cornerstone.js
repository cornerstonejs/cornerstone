
var cornerstoneCore = (function (cornerstoneCore) {
    if(cornerstoneCore === undefined) {
        cornerstoneCore = {};
    }

    var renderCanvas = document.createElement('canvas')
    renderCanvas.width = 1024;
    renderCanvas.height = 1024;

    function drawDebugOverlays(ee, context)
    {
        var lineHeight = 25;
        var y = 30;

        //draw some overlay stuff
        context.fillStyle = 'white';
        context.fillText(ee.ids.studyId, 10, y);
        y+=lineHeight;
        context.fillText(ee.ids.imageId, 10, y);
        y+=lineHeight;
        for(var property in ee.viewport) {
            var str = property + ' = ' + ee.viewport[property];
            context.fillText(str, 10, y);
            y+=lineHeight;
        }
    };

    function drawImage(ee, image) {

        var context = ee.canvas.getContext('2d');

        // clear the canvas
        context.fillStyle = 'black';
        context.fillRect(0,0, ee.canvas.width, ee.canvas.height);

        // setup the viewport
        context.save();
        context.translate(ee.canvas.width/2, ee.canvas.height / 2);
        context.scale(ee.viewport.scale, ee.viewport.scale);
        context.translate(ee.viewport.centerX,ee.viewport.centerY);

        // draw the image
        image.windowCenter = ee.viewport.windowCenter;
        image.windowWidth = ee.viewport.windowWidth;
        var lut = cornerstoneCore.generateLut(image);
        var renderCanvasContext = renderCanvas.getContext("2d");
        var imageData = renderCanvasContext.createImageData(image.columns, image.rows);
        cornerstoneCore.storedPixelDataToCanvasImageData(image, lut, imageData.data);
        renderCanvasContext.putImageData(imageData, 0, 0);
        context.drawImage(renderCanvas, -image.columns / 2, -image.rows / 2);
        context.restore();

        //drawDebugOverlays(ee, context);
    };


    // Module exports
    cornerstoneCore.drawImage = drawImage;

    return cornerstoneCore;
}(cornerstoneCore));

var cornerstoneCore = (function (cornerstoneCore) {
    if(cornerstoneCore === undefined) {
        cornerstoneCore = {};
    }

    function generateLut(image)
    {
        var lut = [];

        for(var storedValue = image.minPixelValue; storedValue <= image.maxPixelValue; storedValue++)
        {
            var modalityLutValue = storedValue * image.slope + image.intercept;
            voiLutValue = (((modalityLutValue - (image.windowCenter)) / (image.windowWidth) + 0.5) * 255.0);
            var clampedValue = Math.min(Math.max(voiLutValue, 0), 255);
            lut[storedValue] = Math.round(clampedValue);
        }

        return lut;
    };


    // Module exports
    cornerstoneCore.generateLut = generateLut;

    return cornerstoneCore;
}(cornerstoneCore));

var cornerstoneCore = (function (cornerstoneCore) {
    if(cornerstoneCore === undefined) {
        cornerstoneCore = {};
    }

    function image()
    {
        var image = {
            minPixelValue : 0,
            maxPixelValue : 257,
            slope: 1.0,
            intercept: 0,
            windowCenter : 127,
            windowWidth : 256,
            storedPixelData: [], // generated below
            rows: 256,
            columns: 256
        };

        var index=0;
        var rnd = Math.round(Math.random() * 255);
        for(var row=0; row < image.rows; row++) {
            for(var column=0; column < image.columns; column++) {
                image.storedPixelData[index] = (rnd + index) % 256;
                index++;
            }
        }

        return image;
    };

    // Module exports
    cornerstoneCore.image = image;

    return cornerstoneCore;
}(cornerstoneCore));

var cornerstoneCore = (function (cornerstoneCore) {
    if(cornerstoneCore === undefined) {
        cornerstoneCore = {};
    }

    function readPixelData(url, cb)
    {
        var oReq = new XMLHttpRequest();
        oReq.open("get", url, true);
        oReq.responseType = "arraybuffer";
        oReq.onload = function (oEvent) {
            cb(oReq.response);
        };
        oReq.send();
    };

    // Module exports
    cornerstoneCore.readPixelData = readPixelData;

    return cornerstoneCore;
}(cornerstoneCore));
var cornerstoneCore = (function (cornerstoneCore) {
    if(cornerstoneCore === undefined) {
        cornerstoneCore = {};
    }

    function storedPixelDataToCanvasImageData(image, lut, canvasImageDataData)
    {
        var canvasImageDataIndex = 0;
        var storedPixelDataIndex = 0;
        for(var row=0; row < image.rows; row++) {
            for(var column=0; column< image.columns; column++) {
                var storedPixelValue = image.storedPixelData[storedPixelDataIndex++];
                var value = lut[storedPixelValue];
                canvasImageDataData[canvasImageDataIndex++] = value; // red
                canvasImageDataData[canvasImageDataIndex++] = value; // green
                canvasImageDataData[canvasImageDataIndex++] = value; // blue
                canvasImageDataData[canvasImageDataIndex++] = 255; // alpha
            }
        }
    };

    // Module exports
    cornerstoneCore.storedPixelDataToCanvasImageData = storedPixelDataToCanvasImageData;

   return cornerstoneCore;
}(cornerstoneCore));
var cornerstone = (function (csc) {
    var cornerstone = {};

    var enabledElements = [];

    var image108 = csc.image();
    var image109 = csc.image();

    csc.readPixelData('../pixels108.raw', function(data) {
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
}(cornerstoneCore));
var cornerstone = (function (cs, csc) {

    if(cs === undefined) {
        cs = {};
    }

    function getAttribute(ee, attrName) {
        var attr = ee.getAttribute(attrName);
        if(attr === undefined) {
            return undefined;
        }
        return attr;
    }

    function enableAllElements()
    {
        var ees = document.querySelectorAll('[data-cornerstoneEnabled]');
        for(var i=0; i < ees.length; i++) {
            var ee = ees[i];
            var studyId = ee.getAttribute('data-cornerstoneStudyId');
            var imageId = ee.getAttribute('data-cornerstoneImageId');

            var viewport =
            {
                scale : getAttribute(ee, 'data-cornerstoneViewportScale'),
                centerX : getAttribute(ee, 'data-cornerstoneViewportCenterX'),
                centerY : getAttribute(ee, 'data-cornerstoneViewportCenterY'),
                windowWidth : getAttribute(ee, 'data-cornerstoneViewportWindowWidth'),
                windowCenter : getAttribute(ee, 'data-cornerstoneViewportWindowCenter')
            };
            cs.enable(ee, studyId, imageId, viewport);
        }
    }

    window.onload = function() {
        enableAllElements();
    };

    cs.enableAllElements = enableAllElements;

    return cs;
}(cornerstone, cornerstoneCore));