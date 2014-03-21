
var cornerstoneCore = (function (cornerstoneCore) {
    if(cornerstoneCore === undefined) {
        cornerstoneCore = {};
    }

    var renderCanvas = document.createElement('canvas')
    renderCanvas.width = 1024;
    renderCanvas.height = 1024;

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

    function image(width, height)
    {
        var image = {
            minPixelValue : 0,
            maxPixelValue : 257,
            slope: 1.0,
            intercept: 0,
            windowCenter : 127,
            windowWidth : 256,
            storedPixelData: [], // generated below
            rows: height,
            columns: width,
            color: false
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
            centerX : 0,//image.columns / 2,
            centerY: 0,//image.rows / 2,
            windowWidth: image.windowWidth,
            windowCenter: image.windowCenter
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
                imageId: imageId
            },
            image:image,
            viewport : viewport
        };
        cornerstone.addEnabledElement(el);
        cornerstone.updateImage(element);
    };


    // module/private exports
    cornerstone.enable = enable;

    return cornerstone;
}(cornerstone, cornerstoneCore));
var cornerstone = (function (cornerstone, csc) {
    if(cornerstone === undefined) {
        cornerstone = {};
    }

    var enabledElements = [];

    function getEnabledElement(element) {
        for(var i=0; i < enabledElements.length; i++) {
            if(enabledElements[i].element == element) {
                return enabledElements[i];
            }
        }
        return undefined;
    };

    function addEnabledElement(el) {
        enabledElements.push(el);
    };

    // module/private exports
    cornerstone.getEnabledElement = getEnabledElement;
    cornerstone.addEnabledElement = addEnabledElement;

    return cornerstone;
}(cornerstone, cornerstoneCore));
var cornerstone = (function (cs, csc) {

    if(cs === undefined) {
        cs = {};
    }

    function fitToWindow(e)
    {
        var ee = cs.getEnabledElement(e);
        var verticalScale = ee.canvas.height / ee.image.rows;
        var horizontalScale = ee.canvas.width / ee.image.columns;
        if(verticalScale > horizontalScale) {
            ee.viewport.scale = verticalScale;
        }
        else {
            ee.viewport.scale = horizontalScale;
        }
        ee.viewport.centerX = 0;
        ee.viewport.centerY = 0;
        cs.updateImage(e);
    };

    cs.fitToWindow = fitToWindow;

    return cs;
}(cornerstone, cornerstoneCore));
var cornerstone = (function (cornerstone, csc) {
    if(cornerstone === undefined) {
        cornerstone = {};
    }

    var imageLoaders = {};

    var unknownImageLoader;

    var imageCache = {
    };

    function loadImageFromImageLoader(imageId) {
        var colonIndex = imageId.indexOf(":");
        var scheme = imageId.substring(0, colonIndex);
        var loader = imageLoaders[scheme];
        if(loader === undefined || loader === null) {
            if(unknownImageLoader !== undefined) {
                var image = unknownImageLoader(imageId);
                return image;
            }
            else {
                return undefined;
            }
        }
        var image = loader(imageId);
        return image;
    }

    // Loads an image given an imageId
    // TODO: make this api async?
    function loadImage(imageId) {
        if(imageCache[imageId] === undefined) {
            var image = loadImageFromImageLoader(imageId);
            imageCache[imageId] = image;
            return image;
        }
        else {
            return imageCache[imageId];
        }
    };

    // registers an imageLoader plugin with cornerstone for the specified scheme
    function registerImageLoader(scheme, imageLoader) {
        imageLoaders[scheme] = imageLoader;
    };

    // Registers a new unknownImageLoader and returns the previous one (if it exists)
    function registerUnknownImageLoader(imageLoader) {
        var oldImageLoader = unknownImageLoader;
        unknownImageLoader = imageLoader;
        return oldImageLoader;
    }

    // module exports

    cornerstone.loadImage = loadImage;
    cornerstone.registerImageLoader = registerImageLoader;
    cornerstone.registerUnknownImageLoader = registerUnknownImageLoader;

    return cornerstone;
}(cornerstone, cornerstoneCore));
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
            var imageId = ee.getAttribute('data-cornerstoneImageId');

            var viewport =
            {
                scale : getAttribute(ee, 'data-cornerstoneViewportScale'),
                centerX : getAttribute(ee, 'data-cornerstoneViewportCenterX'),
                centerY : getAttribute(ee, 'data-cornerstoneViewportCenterY'),
                windowWidth : getAttribute(ee, 'data-cornerstoneViewportWindowWidth'),
                windowCenter : getAttribute(ee, 'data-cornerstoneViewportWindowCenter')
            };
            cs.enable(ee, imageId, viewport);
        }
    }


    var oldOnLoad = window.onload;
    window.onload = function() {
        if(typeof oldOnLoad == 'function') {oldOnLoad();}
        enableAllElements();
    };

    cs.enableAllElements = enableAllElements;

    return cs;
}(cornerstone, cornerstoneCore));
var cornerstone = (function (cornerstone, csc) {
    if(cornerstone === undefined) {
        cornerstone = {};
    }

    cornerstone.showImage = function (element, imageId, viewportOptions) {
        enabledElement = cornerstone.getEnabledElement(element);
        enabledElement.ids.imageId = imageId;
        enabledElement.image = cornerstone.loadImage(imageId);

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
    };

    return cornerstone;
}(cornerstone, cornerstoneCore));
var cornerstone = (function (cornerstone, csc) {
    if(cornerstone === undefined) {
        cornerstone = {};
    }

    function updateImage(element) {
        var ee = cornerstone.getEnabledElement(element);
        var image = ee.image;
        csc.drawImage(ee, image);
    };

    // module exports
    cornerstone.updateImage = updateImage;

    return cornerstone;
}(cornerstone, cornerstoneCore));
var cornerstone = (function (cornerstone, csc) {
    if(cornerstone === undefined) {
        cornerstone = {};
    }

    cornerstone.setViewport= function (element, viewport) {
        enabledElement = cornerstone.getEnabledElement(element);
        if(viewport.windowWidth < 1) {
            viewport.windowWidth = 1;
        }
        if(viewport.scale < 0.0001) {
            viewport.scale = .25;
        }
        enabledElement.viewport = viewport;
        cornerstone.updateImage(element);
    };

    cornerstone.getViewport= function (element) {
        return cornerstone.getEnabledElement(element).viewport;
    };

    // module/private exports

    return cornerstone;
}(cornerstone, cornerstoneCore));