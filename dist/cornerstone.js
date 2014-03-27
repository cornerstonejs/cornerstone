
var cornerstoneCore = (function (cornerstoneCore) {
    if(cornerstoneCore === undefined) {
        cornerstoneCore = {};
    }

    function distanceSquared(pt1, pt2)
    {
        var dx = pt1.x - pt2.x;
        var dy = pt1.y - pt2.y;
        return dx * dx + dy * dy;
    };

    function distance(pt1, pt2)
    {
        var dx = pt1.x - pt2.x;
        var dy = pt1.y - pt2.y;
        return Math.sqrt(dx * dx + dy * dy);
    };

    // Module exports
    cornerstoneCore.distance = distance;
    cornerstoneCore.distanceSquared = distanceSquared;

    return cornerstoneCore;
}(cornerstoneCore));


var cornerstoneCore = (function (cornerstoneCore) {
    if(cornerstoneCore === undefined) {
        cornerstoneCore = {};
    }

    // http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas
    function drawEllipse(ctx, x, y, w, h) {
        var kappa = .5522848,
            ox = (w / 2) * kappa, // control point offset horizontal
            oy = (h / 2) * kappa, // control point offset vertical
            xe = x + w,           // x-end
            ye = y + h,           // y-end
            xm = x + w / 2,       // x-middle
            ym = y + h / 2;       // y-middle

        ctx.beginPath();
        ctx.moveTo(x, ym);
        ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
        ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
        ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
        ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
        ctx.closePath();
        ctx.stroke();
    }

    // Module exports
    cornerstoneCore.drawEllipse = drawEllipse;

    return cornerstoneCore;
}(cornerstoneCore));

var cornerstoneCore = (function (cornerstoneCore) {
    if(cornerstoneCore === undefined) {
        cornerstoneCore = {};
    }

    var renderCanvas = document.createElement('canvas')
    renderCanvas.width = 1024;
    renderCanvas.height = 1024;

    function drawImage(ee, image) {

        var context = ee.canvas.getContext('2d');

        context.setTransform(1, 0, 0, 1, 0, 0);

        // clear the canvas
        context.fillStyle = 'black';
        context.fillRect(0,0, ee.canvas.width, ee.canvas.height);

        // setup the viewport
        context.save();

        setToPixelCoordinateSystem(ee, context);

        // Generate the LUT
        // TODO: Cache the LUT and only regenerate if we have to
        image.windowCenter = ee.viewport.windowCenter;
        image.windowWidth = ee.viewport.windowWidth;
        var lut = cornerstoneCore.generateLut(image);

        // apply the lut to the stored pixel data onto the render canvas
        var renderCanvasContext = renderCanvas.getContext("2d");
        var imageData = renderCanvasContext.createImageData(image.columns, image.rows);
        cornerstoneCore.storedPixelDataToCanvasImageData(image, lut, imageData.data);
        renderCanvasContext.putImageData(imageData, 0, 0);

        var scaler = ee.viewport.scale;

        // Draw the render canvas half the image size (because we set origin to the middle of the canvas above)
        //context.webkitImageSmoothingEnabled = false;
        context.drawImage(renderCanvas, 0,0, image.columns, image.rows, 0, 0, image.columns, image.rows);

        context.restore();

        var event = new CustomEvent(
            "CornerstoneImageRendered",
            {
                detail: {
                    canvasContext: context,
                    viewport: ee.viewport,
                    image: ee.image,
                    element: ee.element,
                    enabledElement: ee,
                },
                bubbles: false,
                cancelable: false
            }
        );
        ee.element.dispatchEvent(event);
    };

    function setToPixelCoordinateSystem(ee, context)
    {
        // reset the transformation matrix
        context.setTransform(1, 0, 0, 1, 0, 0);
        // move origin to center of canvas
        context.translate(ee.canvas.width/2, ee.canvas.height / 2);
        // apply the scale
        context.scale(ee.viewport.scale, ee.viewport.scale);
        // apply the pan offset
        context.translate(ee.viewport.centerX, ee.viewport.centerY);
        // translate the origin back to the corner of the image so the event handlers can draw in image coordinate system
        context.translate(-ee.image.columns /2, -ee.image.rows/2);
    };

    function setToFontCoordinateSystem(ee, context, fontSize)
    {
        // reset the transformation matrix
        context.setTransform(1, 0, 0, 1, 0, 0);
        // move origin to center of canvas
        context.translate(ee.canvas.width/2, ee.canvas.height / 2);
        // apply the scale
        context.scale(ee.viewport.scale, ee.viewport.scale);
        // apply the pan offset
        context.translate(ee.viewport.centerX, ee.viewport.centerY);

        var fontScale = .1;
        // apply the font scale
        context.scale(fontScale, fontScale);
        // translate the origin back to the corner of the image so the event handlers can draw in image coordinate system
        context.translate(-ee.image.columns /2 / fontScale, -ee.image.rows/2 / fontScale);

        // return the font size to use
        var scaledFontSize = fontSize / ee.viewport.scale / fontScale;
        // TODO: actually calculate this?
        var lineHeight  = fontSize / ee.viewport.scale / fontScale;

        return {
            fontSize :scaledFontSize,
            lineHeight:lineHeight,
            fontScale: fontScale
        };

    };

    // Module exports
    cornerstoneCore.drawImage = drawImage;
    cornerstoneCore.setToPixelCoordinateSystem = setToPixelCoordinateSystem;
    cornerstoneCore.setToFontCoordinateSystem = setToFontCoordinateSystem;

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

    }


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
    }

    function addEnabledElement(el) {
        enabledElements.push(el);
    }

    function removeEnabledElement(element) {
        for(var i=0; i < enabledElements.length; i++) {
            if(enabledElements[i].element == element) {
                enabledElements[i].element.removeChild(enabledElements[i].canvas);
                enabledElements.splice(i, 1);
                return;
            }
        }
    }

    function getElementData(el, dataType) {
        var ee = getEnabledElement(el);
        if(ee.data.hasOwnProperty(dataType) == false)
        {
            ee.data[dataType] = {};
        }
        return ee.data[dataType];
    }

    function removeElementData(el, dataType) {
        var ee = getEnabledElement(el);
        delete ee.data[dataType];
    }


    // module/private exports
    cornerstone.getEnabledElement = getEnabledElement;
    cornerstone.addEnabledElement = addEnabledElement;
    cornerstone.removeEnabledElement = removeEnabledElement ;
    cornerstone.getElementData = getElementData;
    cornerstone.removeElementData = removeElementData;

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
        var horizontalScale= ee.canvas.width / ee.image.columns;
        if(horizontalScale < verticalScale) {
            ee.viewport.scale = horizontalScale;
        }
        else {
            ee.viewport.scale = verticalScale;
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

    // Shows a new image in the existing stack
    function newStackImage(element, imageId, viewportOptions)
    {
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
    }

    // shows a new stack
    function newStack(element, imageId, viewportOptions)
    {
        enabledElement = cornerstone.getEnabledElement(element);
        enabledElement.ids.imageId = imageId;
        enabledElement.image = cornerstone.loadImage(imageId);

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
    }

    // This function changes the image while preserving viewport settings.  This is appropriate
    // when changing to a different image in the same stack/series
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
}(cornerstone, cornerstoneCore));
var cornerstone = (function (cornerstone, csc) {
    if(cornerstone === undefined) {
        cornerstone = {};
    }

    // returns an array of stored pixels given an image pixel x,y
    // and width/height
    function getStoredPixels(element, x, y, width, height) {
        x = Math.round(x);
        y = Math.round(y);
        var ee = cornerstone.getEnabledElement(element);
        var storedPixels = [];
        var index = 0;
        for(var row=0; row < height; row++) {
            for(var column=0; column < width; column++) {
                var spIndex = ((row + y) * ee.image.columns) + (column + x);
                storedPixels[index++] = ee.image.storedPixelData[spIndex];
            }
        }
        return storedPixels;
    };

    // module exports
    cornerstone.getStoredPixels = getStoredPixels;

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

    function setViewport(element, viewport) {
        enabledElement = cornerstone.getEnabledElement(element);
        if(viewport.windowWidth < 1) {
            viewport.windowWidth = 1;
        }
        if(viewport.scale < 0.0001) {
            viewport.scale = .25;
        }
        enabledElement.viewport = viewport;
        cornerstone.updateImage(element);

        var event = new CustomEvent(
            "CornerstoneViewportUpdated",
            {
                detail: {
                    viewport: viewport,
                    element: element,
                    image: enabledElement.image

                },
                bubbles: false,
                cancelable: false
            }
        );
        element.dispatchEvent(event);

    }

    function getViewport(element) {
        return cornerstone.getEnabledElement(element).viewport;
    }


    // converts pageX and pageY coordinates in an image enabled element
    // to image coordinates
    function pageToImage(element, pageX, pageY) {
        var ee = cornerstone.getEnabledElement(element);

        // TODO: replace this with a transformation matrix

        // convert the pageX and pageY to the canvas client coordinates
        var rect = element.getBoundingClientRect();
        var clientX = pageX - rect.left - window.scrollX;
        var clientY = pageY - rect.top - window.scrollY;

        // translate the client relative to the middle of the canvas
        var middleX = clientX - rect.width / 2.0;
        var middleY = clientY - rect.height / 2.0;

        // scale to image coordinates middleX/middleY
        var viewport = ee.viewport;
        var scaledMiddleX = middleX / viewport.scale;
        var scaledMiddleY = middleY / viewport.scale;

        // apply pan offset
        var imageX = scaledMiddleX - viewport.centerX;
        var imageY = scaledMiddleY - viewport.centerY;

        // translate to image top left
        imageX += ee.image.columns / 2;
        imageY += ee.image.rows / 2;

        return {
            x: imageX,
            y: imageY
        };
    }

    function resetViewport(element, canvas, image) {
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
        return viewport;
    }

    // module/private exports
    cornerstone.getViewport = getViewport;
    cornerstone.setViewport=setViewport;
    cornerstone.pageToImage=pageToImage;
    cornerstone.resetViewport = resetViewport;

    return cornerstone;
}(cornerstone, cornerstoneCore));
//
// This is a cornerstone imageLoader that generates test images.  These test images
// are useful for debugging as they don't require a server
//

(function (cornerstone) {

    // Loads an image given an imageId
    // TODO: make this api async?
    function loadImage(imageId) {
        var image = {
            minPixelValue : 0,
            maxPixelValue : 255,
            slope: 1.0,
            intercept: 0,
            windowCenter : 127,
            windowWidth : 256,
            storedPixelData: [], // generated below
            rows: 128,
            columns: 256,
            height: 128,
            width: 256,
            color: false,
            columnPixelSpacing: 1.0,
            rowPixelSpacing: 1.0
        };

        var index=0;
        var rnd = Math.round(Math.random() * 255);
        for(var row=0; row < image.rows; row++) {
            for(var column=0; column < image.columns; column++) {
                image.storedPixelData[index] = (column + rnd) % 256;
                index++;
            }
        }

        return image;
    };

    cornerstone.registerImageLoader('test', loadImage);

    return cornerstone;
}(cornerstone));
//
// This image loader returns a blank/black image.  It registers itself with cornerstone
// as the unknown image loader which means it will be called when cornerstone is given an
// imageId with a scheme it doesn't have a plugin for.  Since this shouldn't happen normally,
// we opt to return a blank image rather than return an error to the higher level code
// which couldn't do anything about the error anyway and makes it more complex.
//

(function (cornerstone) {

    // Loads an image given an imageId
    // TODO: make this api async?
    function loadImage(imageId) {
        var image = {
            minPixelValue : 0,
            maxPixelValue : 255,
            slope: 1.0,
            intercept: 0,
            windowCenter : 127,
            windowWidth : 256,
            storedPixelData: [], // generated below
            rows: 256,
            columns: 256,
            height: 256,
            width: 256,
            color: false,
            columnPixelSpacing: 1.0,
            rowPixelSpacing: 1.0
        };

        var index=0;
        for(var row=0; row < image.rows; row++) {
            for(var column=0; column < image.columns; column++) {
                image.storedPixelData[index] = 0;
                index++;
            }
        }

        // write something into the image saying "internal error?"

    };

    cornerstone.registerUnknownImageLoader(loadImage);

}(cornerstone));