/*! cornerstone - v0.0.1 - 2014-04-13 | (c) 2014 Chris Hafey | https://github.com/chafey/cornerstone */
(function () {

    "use strict";

    // Turn off jshint warnings about new Number() in borrowed code below
    /*jshint -W053 */

    // Taken from : http://stackoverflow.com/questions/17907445/how-to-detect-ie11
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

    // Taken from: http://stackoverflow.com/questions/14358599/object-doesnt-support-this-action-ie9-with-customevent-initialization
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

/**
 * This module is responsible for drawing an image to an enabled elements canvas element
 */

var cornerstone = (function (cornerstone) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
    }

    var renderCanvas = document.createElement('canvas');
    var renderCanvasContext;
    var renderCanvasData;
    var lastRenderedImageId;
    var lastRenderedViewport = {};

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
        if(image.lut !== undefined &&
           image.lut.windowCenter === viewport.windowCenter &&
            image.lut.windowWidth === viewport.windowWidth &&
            image.lut.invert === viewport.invert) {
            return image.lut;
        }

        // lut is invalid or not present, regenerate it and cache it
        image.lut = cornerstone.generateLut(image, viewport.windowWidth, viewport.windowCenter, viewport.invert);
        image.lut.windowWidth = viewport.windowWidth;
        image.lut.windowCenter = viewport.windowCenter;
        image.lut.invert = viewport.invert;
        return image.lut;
    }

    function doesImageNeedToBeRendered(ee, image)
    {
        if(image.imageId !== lastRenderedImageId ||
           lastRenderedViewport.windowCenter !== ee.viewport.windowCenter ||
           lastRenderedViewport.windowWidth !== ee.viewport.windowWidth ||
           lastRenderedViewport.invert !== ee.viewport.invert)
        {
            return true;
        }

        return false;
    }

    /**
     * Internal API function to draw an image to a given enabled element
     * @param ee
     * @param image
     */
    function drawImage(ee, image) {

        var start = new Date();


        // get the canvas context and reset the transform
        var context = ee.canvas.getContext('2d');
        context.setTransform(1, 0, 0, 1, 0, 0);

        // clear the canvas
        context.fillStyle = 'black';
        context.fillRect(0,0, ee.canvas.width, ee.canvas.height);

        // save the canvas context state and apply the viewport properties
        context.save();
        cornerstone.setToPixelCoordinateSystem(ee, context);


        // check to see if the image in renderedCanvas needs to be rerendered or not
        if(doesImageNeedToBeRendered(ee, image))
        {
            // If our render canvas does not match the size of this image reset it
            // NOTE: This might be inefficient if we are updating multiple images of different
            // sizes frequently.
            if(renderCanvas.width !== image.width || renderCanvas.height != image.height) {
                initializeRenderCanvas(image);
            }

            // get the lut to use
            var lut = getLut(image, ee.viewport);

            // apply the lut to the stored pixel data onto the render canvas
            cornerstone.storedPixelDataToCanvasImageData(image, lut, renderCanvasData.data);
            renderCanvasContext.putImageData(renderCanvasData, 0, 0);

            lastRenderedImageId = image.imageId;
            lastRenderedViewport.windowCenter = ee.viewport.windowCenter;
            lastRenderedViewport.windowWidth = ee.viewport.windowWidth;
            lastRenderedViewport.invert = ee.viewport.invert;
        }


        // turn off image smooth/interpolation if pixelReplication is set in the viewport
        if(ee.viewport.pixelReplication === true) {
            context.imageSmoothingEnabled = false;
            context.mozImageSmoothingEnabled = false; // firefox doesn't support imageSmoothingEnabled yet
        }
        else {
            context.imageSmoothingEnabled = true;
            context.mozImageSmoothingEnabled = true;
        }

        // Draw the render canvas half the image size (because we set origin to the middle of the canvas above)
        context.drawImage(renderCanvas, 0,0, image.columns, image.rows, 0, 0, image.columns, image.rows);

        context.restore();

        var end = new Date();
        var diff = end - start;
        cornerstone.lastRenderTimeInMs = diff;

        var event = new CustomEvent(
            "CornerstoneImageRendered",
            {
                detail: {
                    canvasContext: context,
                    viewport: ee.viewport,
                    image: ee.image,
                    element: ee.element,
                    enabledElement: ee
                },
                bubbles: false,
                cancelable: false
            }
        );
        ee.element.dispatchEvent(event);


    }

    // Module exports
    cornerstone.drawImage = drawImage;

    return cornerstone;
}(cornerstone));
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
            imageId: "",
            imageIdHistory: [],
            data : {}
        };
        cornerstone.addEnabledElement(el);

        cornerstone.showImage(element, imageId, viewportOptions);
    }


    // module/private exports
    cornerstone.enable = enable;

    return cornerstone;
}(cornerstone));
/**
 * This module looks for elements in the document that have cornerstone markup attributes
 * and applies them.  It also registers a window.onload handle to automatically do this
 * after the document has been loaded
 */
var cornerstone = (function (cs) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
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
            cornerstone.enable(ee, imageId, viewport);
        }
    }


    var oldOnLoad = window.onload;
    window.onload = function() {
        if(typeof oldOnLoad == 'function') {oldOnLoad();}
        enableAllElements();
    };

    cornerstone.enableAllElements = enableAllElements;

    return cornerstone;
}(cornerstone));
var cornerstone = (function (cornerstone) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
    }

    function getElementData(el, dataType) {
        var ee = cornerstone.getEnabledElement(el);
        if(ee.data.hasOwnProperty(dataType) === false)
        {
            ee.data[dataType] = {};
        }
        return ee.data[dataType];
    }

    function removeElementData(el, dataType) {
        var ee = cornerstone.getEnabledElement(el);
        delete ee.data[dataType];
    }

    // module/private exports
    cornerstone.getElementData = getElementData;
    cornerstone.removeElementData = removeElementData;

    return cornerstone;
}(cornerstone));
var cornerstone = (function (cornerstone) {

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

    // module/private exports
    cornerstone.getEnabledElement = getEnabledElement;
    cornerstone.addEnabledElement = addEnabledElement;
    cornerstone.removeEnabledElement = removeEnabledElement ;

    return cornerstone;
}(cornerstone));
/**
 * This module will fit an image to fit inside the canvas displaying it such that all pixels
 * in the image are viewable
 */
var cornerstone = (function (cornerstone) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
    }

    /**
     * Adjusts an images scale and center so all pixels are viewable and the image is centered.
     * @param element
     */
    function fitToWindow(element)
    {
        var enabledElement = cornerstone.getEnabledElement(element);
        var defaultViewport = cornerstone.getDefaultViewport(enabledElement.canvas, enabledElement.image);
        enabledElement.viewport.scale = defaultViewport.scale;
        enabledElement.viewport.centerX = defaultViewport.centerX;
        enabledElement.viewport.centerY = defaultViewport.centerY;
        cornerstone.updateImage(element);
    }

    cornerstone.fitToWindow = fitToWindow;

    return cornerstone;
}(cornerstone));
/**
 * This module generates a lut for an image
 */

var cornerstone = (function (cornerstone) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
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
    cornerstone.generateLut = generateLut;

    return cornerstone;
}(cornerstone));
/**
 * This module contains a function to get a default viewport for an image given
 * a canvas element to display it in
 *
 */
var cornerstone = (function (cornerstone) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
    }

    /**
     * Creates a new viewport object containing default values for the image and canvas
     * @param canvas
     * @param image
     * @returns {{scale: number, centerX: number, centerY: number, windowWidth: (image.windowWidth|*), windowCenter: (image.windowCenter|*), invert: *}}
     */
    function getDefaultViewport(canvas, image) {
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
    cornerstone.getDefaultViewport = getDefaultViewport;

    return cornerstone;
}(cornerstone));
/**
 * This module returns a subset of the stored pixels of an image
 */
var cornerstone = (function (cornerstone) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
    }

    /**
     * Returns an array of stored pixels given a rectangle in the image
     * @param element
     * @param x
     * @param y
     * @param width
     * @param height
     * @returns {Array}
     */
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
}(cornerstone));
/**
 * This module deals with ImageLoaders, loading images and caching images
 */

var cornerstone = (function (cornerstone) {

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
}(cornerstone));
/**
 * This module contains a helper function to covert page coordinates to pixel coordinates
 */
var cornerstone = (function (cornerstone) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
    }

    /**
     * Converts a point in the page coordinate system to the pixel coordinate
     * system
     * @param element
     * @param pageX
     * @param pageY
     * @returns {{x: number, y: number}}
     */

    function pageToPixel(element, pageX, pageY) {
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

    // module/private exports
    cornerstone.pageToPixel = pageToPixel;

    return cornerstone;
}(cornerstone));
/**
 * This module sets the transformation matrix for a canvas context so it displays fonts
 * smoothly even when the image is highly scaled up
 */

var cornerstone = (function (cornerstone) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
    }

    /**
     * Sets the canvas context transformation matrix so it is scaled to show text
     * more cleanly even if the image is scaled up.  See
     * https://github.com/chafey/cornerstoneTools/wiki/DrawingText
     * for more information
     *
     * @param ee
     * @param context
     * @param fontSize
     * @returns {{fontSize: number, lineHeight: number, fontScale: number}}
     */
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
    cornerstone.setToFontCoordinateSystem = setToFontCoordinateSystem;

    return cornerstone;
}(cornerstone));
/**
 * This module contains a function that will set the canvas context to the pixel coordinates system
 * making it easy to draw geometry on the image
 */

var cornerstone = (function (cornerstone) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
    }

    /**
     * Sets the canvas context transformation matrix to the pixel coordinate system.  This allows
     * geometry to be driven using the canvas context using coordinates in the pixel coordinate system
     * @param ee
     * @param context
     */
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

    // Module exports
    cornerstone.setToPixelCoordinateSystem = setToPixelCoordinateSystem;

    return cornerstone;
}(cornerstone));
/**
 * This module contains functions that deal with changing the image displays in an enabled element
 */
var cornerstone = (function (cornerstone) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
    }

    /**
     * This function changes the imageId displayed in the enabled element and applies the properties
     * in viewport.  If viewport is not supplied, the default viewport is used.
     * @param element
     * @param imageId
     * @param viewport
     */
    function showImage(element, imageId, viewport) {
        var enabledElement = cornerstone.getEnabledElement(element);
        enabledElement.imageIdHistory.unshift(imageId);
        var loadImageDeferred = cornerstone.loadImage(imageId);
        loadImageDeferred.done(function(image) {
            // scan through the imageIdHistory to see if this imageId should be displayed
            for(var i=0; i < enabledElement.imageIdHistory.length; i++)
            {
                if(enabledElement.imageIdHistory[i] === image.imageId) {
                    enabledElement.imageId = imageId;
                    // remove all imageId's after this one
                    var numToRemove = enabledElement.imageIdHistory.length - i;
                    //console.log('removing ' + numToRemove + " stale entries from imageIdHistory, " + (enabledElement.imageIdHistory.length - numToRemove) + " remaining");
                    enabledElement.imageIdHistory.splice(i, numToRemove );

                    enabledElement.image = image;

                    if(enabledElement.viewport === undefined) {
                        enabledElement.viewport = cornerstone.getDefaultViewport(enabledElement.canvas, image);
                    }

                    enabledElement.viewport = cornerstone.getDefaultViewport(enabledElement.canvas, image);

                    // merge
                    if(viewport) {
                        for(var attrname in viewport)
                        {
                            if(viewport[attrname] !== null) {
                                enabledElement.viewport[attrname] = viewport[attrname];
                            }
                        }
                    }
                    cornerstone.updateImage(element);

                    // fire an event indicating the viewport has been changed
                    var event = new CustomEvent(
                        "CornerstoneViewportUpdated",
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

                    event = new CustomEvent(
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
                    return;
                }
            }
        });
    }

    // module exports
    cornerstone.showImage = showImage;
    return cornerstone;
}(cornerstone));
/**
 * This module contains a function to convert stored pixel values to display pixel values using a LUT
 */
var cornerstone = (function (cornerstone) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
    }

    /**
     * This function transforms stored pixel values into a canvas image data buffer
     * by using a LUT.  This is the most performance sensitive code in cornerstone and
     * we use a special trick to make this go as fast as possible.  Specifically we
     * use the alpha channel only to control the luminance rather than the red, green and
     * blue channels which makes it over 3x faster.  The canvasImageDataData buffer needs
     * to be previously filled with white pixels.
     *
     * NOTE: Attribution would be appreciated if you use this technique!
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
    cornerstone.storedPixelDataToCanvasImageData = storedPixelDataToCanvasImageData;

   return cornerstone;
}(cornerstone));
/**
 * This module contains a function to immediately redraw an image
 */
var cornerstone = (function (cornerstone) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
    }

    /**
     * Forces the image to be updated/redrawn for the specified enabled element
     * @param element
     */
    function updateImage(element) {
        var ee = cornerstone.getEnabledElement(element);
        var image = ee.image;
        // only draw the image if it has loaded
        if(image !== undefined) {
            cornerstone.drawImage(ee, image);
        }
    }

    // module exports
    cornerstone.updateImage = updateImage;

    return cornerstone;
}(cornerstone));
/**
 * This module contains functions to deal with getting and setting the viewport for an enabled element
 */
var cornerstone = (function (cornerstone) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
    }

    function setViewport(element, viewport) {

        var enabledElement = cornerstone.getEnabledElement(element);

        // prevent window width from being < 1
        if(viewport.windowWidth < 1) {
            viewport.windowWidth = 1;
        }
        // prevent scale from getting too small
        if(viewport.scale < 0.0001) {
            viewport.scale = 0.25;
        }

        enabledElement.viewport = viewport;

        // Force the image to be updated since the viewport has been modified
        cornerstone.updateImage(element);


        // Fire an event letting others know that the viewort has been updated so they
        // can take the appropriate action
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

    /**
     * Returns the viewport for the specified enabled element
     * @param element
     * @returns {*}
     */
    function getViewport(element) {
        return cornerstone.getEnabledElement(element).viewport;
    }

    // module/private exports
    cornerstone.getViewport = getViewport;
    cornerstone.setViewport=setViewport;

    return cornerstone;
}(cornerstone));