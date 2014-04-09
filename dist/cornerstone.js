
(function () {

    "use strict";

    /*jshint -W053 */

    function ie_ver(){
        var iev=0;
        var ieold = (/MSIE (\d+\.\d+);/.test(navigator.userAgent));
        var trident = !!navigator.userAgent.match(/Trident\/7.0/);
        var rv=navigator.userAgent.indexOf("rv:11.0");

        if (ieold) iev=new Number(RegExp.$1);
        if (navigator.appVersion.indexOf("MSIE 10") != -1) iev=10;
        if (trident&&rv!=-1) iev=11;

        return iev;
    }

    var ieVer = ie_ver();
    if(ieVer <= 11) {
        (function () {
            function CustomEvent ( event, params ) {
                params = params || { bubbles: false, cancelable: false, detail: undefined };
                var evt = document.createEvent( 'CustomEvent' );
                evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
                return evt;
            }

            CustomEvent.prototype = window.Event.prototype;

            window.CustomEvent = CustomEvent;
        })();
    }

}());


var cornerstoneCore = (function (cornerstoneCore) {

    "use strict";

    if(cornerstoneCore === undefined) {
        cornerstoneCore = {};
    }

    var renderCanvas = document.createElement('canvas');
    var renderCanvasContext;
    var renderCanvasData;

    function initializeRenderCanvas(image)
    {
        // Resize the canvas
        renderCanvas.width = image.width;
        renderCanvas.height = image.height;

        // NOTE - we need to fill the render canvas with white pixels since we control the luminance
        // using the alpha channel to improve rendering performance.
        renderCanvasContext = renderCanvas.getContext('2d');
        renderCanvasContext.fillStyle = 'white';
        renderCanvasContext.fillRect(0,0, renderCanvas.width, renderCanvas.height);
        renderCanvasData = renderCanvasContext.getImageData(0,0,image.width, image.height);
    }

    function getLut(image, viewport)
    {
        // if we have a cached lut and it has the right values, return it immediately
        if(image.lut !== undefined && image.lut.windowCenter === viewport.windowCenter && image.lut.windowWidth === viewport.windowWidth) {
            //console.log('using cached lut');
            return image.lut;
        }

        // lut is invalid or not present, regenerate it and cache it
        //console.log('generating lut');
        image.lut = cornerstoneCore.generateLut(image, viewport.windowWidth, viewport.windowCenter, viewport.invert);
        image.lut.windowWidth = viewport.windowWidth;
        image.lut.windowCenter = viewport.windowCenter;
        return image.lut;
    }

    function drawImage(ee, image) {

        // get the canvas context and reset the transform
        var context = ee.canvas.getContext('2d');
        context.setTransform(1, 0, 0, 1, 0, 0);

        // clear the canvas
        context.fillStyle = 'black';
        context.fillRect(0,0, ee.canvas.width, ee.canvas.height);

        // If our render canvas does not match the size of this image reset it
        // NOTE: This will be inefficient if we are updating multiple images of different
        // sizes frequently, but I don't know how much...
        if(renderCanvas.width !== image.width || renderCanvas.height != image.height) {
            initializeRenderCanvas(image);
        }

        // save the canvas context state and apply the viewport properties
        context.save();
        setToPixelCoordinateSystem(ee, context);

        // generate the lut
        var lut = getLut(image, ee.viewport);

        // apply the lut to the stored pixel data onto the render canvas
        cornerstoneCore.storedPixelDataToCanvasImageData(image, lut, renderCanvasData.data);
        renderCanvasContext.putImageData(renderCanvasData, 0, 0);

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
    }

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
    }

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

        var fontScale = 0.1;
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

    }

    // Module exports
    cornerstoneCore.drawImage = drawImage;
    cornerstoneCore.setToPixelCoordinateSystem = setToPixelCoordinateSystem;
    cornerstoneCore.setToFontCoordinateSystem = setToFontCoordinateSystem;

    return cornerstoneCore;
}(cornerstoneCore));

var cornerstoneCore = (function (cornerstoneCore) {

    "use strict";

    if(cornerstoneCore === undefined) {
        cornerstoneCore = {};
    }

    /**
     * Creates a LUT used while rendering to convert stored pixel values to
     * display pixels
     *
     * @param image
     * @returns {Array}
     */
    function generateLut(image, windowWidth, windowCenter, invert)
    {
        var lut = [];

        var maxPixelValue = image.maxPixelValue;
        var slope = image.slope;
        var intercept = image.intercept;
        var localWindowWidth = windowWidth;
        var localWindowCenter = windowCenter;

        var modalityLutValue;
        var voiLutValue;
        var clampedValue;
        var storedValue;

        if(invert === true) {
            for(storedValue = image.minPixelValue; storedValue <= maxPixelValue; storedValue++)
            {
                modalityLutValue = storedValue * slope + intercept;
                voiLutValue = (((modalityLutValue - (localWindowCenter)) / (localWindowWidth) + 0.5) * 255.0);
                clampedValue = Math.min(Math.max(voiLutValue, 0), 255);
                lut[storedValue] = Math.round(255 - clampedValue);
            }
        }
        else {
            for(storedValue = image.minPixelValue; storedValue <= maxPixelValue; storedValue++)
            {
                modalityLutValue = storedValue * slope + intercept;
                voiLutValue = (((modalityLutValue - (localWindowCenter)) / (localWindowWidth) + 0.5) * 255.0);
                clampedValue = Math.min(Math.max(voiLutValue, 0), 255);
                lut[storedValue] = Math.round(clampedValue);
            }
        }


        return lut;
    }


    // Module exports
    cornerstoneCore.generateLut = generateLut;

    return cornerstoneCore;
}(cornerstoneCore));
var cornerstoneCore = (function (cornerstoneCore) {

    "use strict";

    if(cornerstoneCore === undefined) {
        cornerstoneCore = {};
    }

    /**
     * This function transforms stored pixel values into a canvas image data buffer
     * by using a LUT.  This is the most performance sensitive code in cornerstone and
     * we use a special trick to make this go as fast as possible.  Specifically we
     * use the alpha channel only to control the luminance rather than the red, green and
     * blue channels which makes it over 3x faster.  The canvasImageDataData buffer needs
     * to be previously filled with white pixels.
     *
     * @param image the image object
     * @param lut the lut
     * @param canvasImageDataData a canvasImgageData.data buffer filled with white pixels
     */
    function storedPixelDataToCanvasImageData(image, lut, canvasImageDataData)
    {
        var canvasImageDataIndex = 3;
        var storedPixelDataIndex = 0;
        var numPixels = image.width * image.height;
        var storedPixelData = image.storedPixelData;
        var localLut = lut;
        var localCanvasImageDataData = canvasImageDataData;
        while(storedPixelDataIndex < numPixels) {
            localCanvasImageDataData[canvasImageDataIndex] = localLut[storedPixelData[storedPixelDataIndex++]]; // alpha
            canvasImageDataIndex += 4;
        }
    }

    // Module exports
    cornerstoneCore.storedPixelDataToCanvasImageData = storedPixelDataToCanvasImageData;

   return cornerstoneCore;
}(cornerstoneCore));
var cornerstone = (function (cornerstone, csc) {

    "use strict";

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
}(cornerstone, cornerstoneCore));
var cornerstone = (function (cornerstone, csc) {

    "use strict";

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
            if(enabledElements[i].element === element) {
                enabledElements[i].element.removeChild(enabledElements[i].canvas);
                enabledElements.splice(i, 1);
                return;
            }
        }
    }

    function getElementData(el, dataType) {
        var ee = getEnabledElement(el);
        if(ee.data.hasOwnProperty(dataType) === false)
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

    "use strict";

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
    }

    cs.fitToWindow = fitToWindow;

    return cs;
}(cornerstone, cornerstoneCore));
var cornerstone = (function (cornerstone, csc) {

    "use strict";

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
        var image;
        if(loader === undefined || loader === null) {
            if(unknownImageLoader !== undefined) {
                image = unknownImageLoader(imageId);
                return image;
            }
            else {
                return undefined;
            }
        }
        image = loader(imageId);
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
    }

    // registers an imageLoader plugin with cornerstone for the specified scheme
    function registerImageLoader(scheme, imageLoader) {
        imageLoaders[scheme] = imageLoader;
    }

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

    "use strict";

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
}(cornerstone, cornerstoneCore));
var cornerstone = (function (cornerstone, csc) {

    "use strict";

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
    }

    // module exports
    cornerstone.getStoredPixels = getStoredPixels;

    return cornerstone;
}(cornerstone, cornerstoneCore));
var cornerstone = (function (cornerstone, csc) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
    }

    function updateImage(element) {
        var ee = cornerstone.getEnabledElement(element);
        var image = ee.image;
        // only draw the image if it has loaded
        if(image !== undefined) {
            csc.drawImage(ee, image);
        }
    }

    // module exports
    cornerstone.updateImage = updateImage;

    return cornerstone;
}(cornerstone, cornerstoneCore));
var cornerstone = (function (cornerstone, csc) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
    }

    function setViewport(element, viewport) {
        var enabledElement = cornerstone.getEnabledElement(element);
        if(viewport.windowWidth < 1) {
            viewport.windowWidth = 1;
        }
        if(viewport.scale < 0.0001) {
            viewport.scale = 0.25;
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

        if(ee.image === undefined) {
            return {
                x:0,
            y:0};
        }
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
            windowCenter: image.windowCenter,
            invert: image.invert
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