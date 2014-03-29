
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
        loadImageDeferred.done(function(image){
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
        });

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
//
// This is a very simple DICOM Parser for parsing DICOM Part 10 encoded byte streams
// Functionality Implemented:
//  * DICOM Part10 header verification
//  * Explicit Little Endian Transfer Syntax (and the other compression syntaxes that encode in explicit little endian)
//  * Implicit Little Endian Transfer Syntax
//  * Extracting string VR types
//  * Extracting US and UL VR types
//  * Offset of the data for each attribute so the caller can parse the data as it likes
//  * Sequences of known and unknown length with items containing known and unknown lengths
//  TOOD: Look into encapsulated multiframe as I seem to recall some trickerie associated with it
// Not supported:
//  Big Endian transfer syntaxes
//

(function (cornerstone)
{

    ////////// begin data buffer parser helpers ////////

    function readUint32(data, offset)
    {
        return data[offset]
            + (data[offset+1] << 8)
            + (data[offset + 2] << 16)
            + (data[offset + 3] << 24);
    }

    function readUint16(data, offset)
    {
        return data[offset] + (data[offset+1] << 8);
    }

    function readString(data, offset, length)
    {
        var result = "";
        for(var i=0; i < length; i++)
        {
            var byte = data[offset + i];
            if(byte != 0)
            {
                result += String.fromCharCode(byte);
            }
        }
        return result;
    }

    ////////// end data buffer parser helpers ////////




    ////////// begin sequence item parsing ////////

    function parseSQItemUndefinedLength(data, offset, sqItem, explicit)
    {
        // scan up until we find a item delimiter tag
        while(offset < data.length)
        {
            var element = readElement(data, offset, explicit);
            offset = element.dataOffset + element.length;
            sqItem[element.tag] = element;

            // we hit an item delimeter tag, return the current offset to mark
            // the end of this sequence item
            if(element.groupNumber === 0xfffe && element.elementNumber === 0xe00d)
            {
                // NOTE: There should be 0x00000000 following the group/element but there really is no
                // use in checking it - what are we gonna do if it isn't 0:?
                return offset;
            }
        }

        // Buffer overread!  Return current offset so at least they get the data we did read.  Would be nice
        // to indicate the caller this happened though...
        return offset;
    }

    // TODO: Find some data to verify this with
    function parseSQItemKnownLength(data, offset, itemLength, sqItem, explicit)
    {
        // Sanity check the offsets
        if(offset + itemLength > data.length)
        {
            throw "sequence item offsets mismatch";
        }

        // scan up until we find a item delimiter tag
        while(offset < offset + itemLength )
        {
            var element = readElement(data, offset, explicit);
            offset = element.dataOffset + element.length;
            sqItem[element.tag] = element;
        }

        // TODO: Might be good to sanity check offsets and tell user if the overran the buffer
    }

    function readSequenceItem(data, offset, explicit)
    {
        var groupNumber = readUint16(data, offset);
        var elementNumber = readUint16(data, offset+2);
        var itemLength = readUint32(data, offset+4);
        offset += 8;

        var item =
        {
            groupNumber: groupNumber,
            elementNumber: elementNumber,
            elements : {},
            length: itemLength,
            dataOffset: offset
        };

        if(itemLength === -1)
        {
            offset = parseSQItemUndefinedLength(data, offset, item, explicit);
            item.length = offset - item.dataOffset;
        }
        else
        {
            parseSQItemKnownLength(data, offset, itemLength, item, explicit);
        }
        return item;
    }

    ////////// end sequence item parsing ////////




    ////////// begin sequence element parsing ////////

    function parseSQElementUndefinedLength(data, element, explicit)
    {
        element.items = [];
        var offset = element.dataOffset;
        while(offset < data.length)
        {
            var item = readSequenceItem(data, offset, explicit);
            offset += item.length + 8;
            element.items.push(item);

            // If this is the sequence delimitiation item, return the offset of the next element
            if(item.groupNumber === 0xFFFE && item.elementNumber === 0xE0DD)
            {
                // sequence delimitation item, update attr data length and return
                element.length = offset - element.dataOffset;
                return offset;
            }
        }

        // Buffer overread!  Set the length of the element to reflect the end of buffer so
        // the caller has access to what we were able to parse.
        // TODO: Figure out how to communicate parse errors like this to the caller
        element.length = offset - element.dataOffset;
    }

    // TODO: Find some data to verify this with
    function parseSQElementKnownLength(data, element, explicit)
    {
        element.items = [];
        var offset = element.dataOffset;
        while(offset < element.dataOffset + element.length)
        {
            var item = readSequenceItem(data, offset, explicit);
            offset += item.length + 8;
            element.items.push(item);
        }

        // TODO: Might be good to sanity check offsets and tell user if the overran the buffer
    }

    ////////// endsequence element parsing ////////



    ////// begin element parsing /////

    function isStringVr(vr)
    {
        if(vr === 'AT'
            || vr === 'FL'
            || vr === 'FD'
            || vr === 'OB'
            || vr === 'OF'
            || vr === 'OW'
            || vr === 'SI'
            || vr === 'SQ'
            || vr === 'SS'
            || vr === 'UL'
            || vr === 'US'
            )
        {
            return false;
        }
        return true;
    }

    // this function converts the data associated with the element
    // into the right type based on the VR and adds it to the element
    function setDataExplicit(data, element)
    {
        // TODO: add conversions for the other VR's
        if(isStringVr(element.vr))
        {
            element.str = readString(data, element.dataOffset, element.length);
        }
        else if(element.vr == 'UL')
        {
            element.uint32 = readUint32(data, element.dataOffset);
        }
        else if(element.vr == 'US')
        {
            element.uint16 = readUint16(data, element.dataOffset);
        }
        else if(element.vr == 'SQ')  // TODO: UN, OB, OW
        {
            if(element.length === -1)
            {
                parseSQElementUndefinedLength(data, element, true);
            }
            else
            {
                parseSQElementKnownLength(data, element, true);
            }
        }
    }

    function setDataImplicit(data, element)
    {
        // Here we add the most common VR's to the attribute.  This is not
        // perfect but it is cheap, fast, simple and allows more correct
        // data casting to happen at a higher level with a data dictionary if desired.
        // We do capture the offset of the data in the attribute to support this
        // when it is needed.

        // most attributes are strings so assume it is one.  We could be smarter
        // here and use heuristics but the cost to actually create a string is
        // almost the same so why bother.
        element.str = readString(data, element.dataOffset, element.length);

        // provide uint32 and uint16 data if the length is right for
        // those data types.  This obviously won't be meaningful
        // in all cases (e.g. a string could be 4 bytes long)
        if(element.length === 4)
        {
            element.uint32 = readUint32(data, element.dataOffset);
        }
        else if(attr.length === 2)
        {
            element.uint16 = readUint16(data, element.dataOffset);
        }
    }

    function getDataLengthSizeInBytesForVR(vr)
    {
        if(vr === 'OB'
            || vr === 'OW'
            || vr === 'SQ'
            || vr === 'OF'
            || vr === 'UT'
            || vr === 'UN')
        {
            return 4;
        }
        else
        {
            return 2;
        }
    }

    function setLengthAndDataOffsetExplicit(data, offset, element)
    {
        var dataLengthSizeBytes = getDataLengthSizeInBytesForVR(element.vr);
        if(dataLengthSizeBytes === 2)
        {
            element.length = readUint16(data, offset+6);
            element.dataOffset = offset + 8;
        }
        else
        {
            element.length = readUint32(data, offset+8);
            element.dataOffset = offset + 12;
        }
    }

    function setLengthAndDataOffsetImplicit(data, offset, element)
    {
        element.length = readUint32(data, offset+4);
        element.dataOffset = offset + 8;
    }

    function readElement(data, offset, explicit)
    {
        var groupNumber = readUint16(data, offset);
        var elementNumber = readUint16(data, offset+2);
        var tag = ('00000000' + ((groupNumber << 16) + elementNumber).toString(16)).substr(-8);
        var element =
        {
            groupNumber : groupNumber,
            elementNumber: elementNumber,
            tag : 'x' + tag

            //vr : '', // set below if explicit
            //length: 0, // set below
            //dataOffset: 0 // set below
        };

        if(explicit === true)
        {
            element.vr = readString(data, offset+4, 2);
            setLengthAndDataOffsetExplicit(data, offset, element);
            setDataExplicit(data, element);
        }
        else
        {
            setLengthAndDataOffsetImplicit(data, offset, element);
            setDataImplicit(data, element);
        }

        return element;
    }

    ////// end element parsing /////

    function isExplicit(dicomP10HeaderElements) {
        var transferSyntax = dicomP10HeaderElements.x00020010.str;
        if(transferSyntax === '1.2.840.10008.1.2')
        {
            return false;
        }
        else if(transferSyntax === '1.2.840.10008.1.2.2')  // explicit big endian is not supported
        {
            return undefined;
        }
        // all other transfer syntaxes should be explicit
        return true;
    }

    function prefixIsInvalid(data)
    {
        return (data[128] !== 68 || // D
                data[129] !== 73 || // I
                data[130] !== 67 || // C
                data[131] !== 77);  // M
    }

    //
    // Parses a DICOM Part 10 byte stream and returns a javascript
    // object containing properties for each element found named
    // using its tag.  For example, the Rows element 0028,0010 would
    // be named 'x00280010'.  dicomFileAsArrayBuffer is an ArrayBuffer
    // that contains the DICOM Part 10 byte stream
    //
    function parseDicom(dicomPart10AsArrayBuffer)
    {
        var data = new Uint8Array(dicomPart10AsArrayBuffer);

        // Make sure we have a DICOM P10 File
        if(prefixIsInvalid(data))
        {
            return undefined;
        }

        var elements = {}; // the is what we return to the caller populated with parsed elements

        var offset = 132; // position offset at the first part 10 header attribute

        // read the group length element
        var groupLengthElement = readElement(data, offset, true);
        offset = groupLengthElement.dataOffset + groupLengthElement.length;
        elements[groupLengthElement.tag] = groupLengthElement;

        // read part 10 header
        var offsetOfFirstElementAfterMetaHeader = offset + groupLengthElement.uint32;
        while(offset < offsetOfFirstElementAfterMetaHeader)
        {
            var element = readElement(data, offset, true);
            offset = element.dataOffset + element.length;
            elements[element.tag] = element;
        }

        // Check to see if this is explicit little endian or implicit little endian encoding
        // NOTE: Big endian is not supported
        var explicit = isExplicit(elements);
        if(explicit === undefined)
        {
            return undefined; // big endian, cannot parse
        }

        // Now read the rest of the elements
        while(offset < data.length)
        {
            var element = readElement(data, offset, explicit);
            offset = element.dataOffset + element.length;
            elements[element.tag] = element;
        }

        return elements;
    }

    cornerstone.parseDicom = parseDicom;

    return cornerstone;
}(cornerstone));
//
// This is a cornerstone image loader for WADO requests.  It currently only supports WADO objects returned in
// explit little endian transfer syntax so the WADO URL should include &transferSyntax=1.2.840.10008.1.2.1
// if needed
//

(function ($, cornerstone) {

    function getPixelSpacing(dicomElements)
    {
        // NOTE - these are not required for all SOP Classes
        // so we return them as undefined.  We also do not
        // deal with the complexity associated with projection
        // radiographs here and leave that to a higher layer
        var pixelSpacingAttr  = dicomElements.x00280030;
        if(pixelSpacingAttr && pixelSpacingAttr.str.length > 0) {
            var split = pixelSpacingAttr.str.split('\\');
            var result =
            {
                row: parseFloat(split[0]),
                column: parseFloat(split[1])
            };
            return result;
        }
        else {
            var result =
            {
                row: undefined,
                column: undefined
            };
            return result;
        }
    }

    function getPixelFormat(dicomElements) {
        // NOTE - this should work for color images too - need to test
        var pixelRepresentation = dicomElements.x00280103.uint16;
        var bitsAllocated = dicomElements.x00280100.uint16;
        if(pixelRepresentation === 0 && bitsAllocated === 8) {
            return 1; // unsigned 8 bit
        } else if(pixelRepresentation === 0 && bitsAllocated === 16) {
            return 2; // unsigned 16 bit
        } else if(pixelRepresentation === 1 && bitsAllocated === 16) {
            return 3; // signed 16 bit data
        }
    }

    function extractStoredPixels(dicomElements, dicomPart10AsArrayBuffer)
    {
        var pixelFormat = getPixelFormat(dicomElements);
        var pixelDataElement = dicomElements.x7fe00010;
        var pixelDataOffset = pixelDataElement.dataOffset;

        // Note - we may want to sanity check the rows * columns * bitsAllocated * samplesPerPixel against the buffer size

        if(pixelFormat === 1) {
            return new Uint8Array(dicomPart10AsArrayBuffer, pixelDataOffset);
        }
        else if(pixelFormat === 2) {
            return new Uint16Array(dicomPart10AsArrayBuffer, pixelDataOffset);
        }
        else if(pixelFormat === 3) {
            return new Int16Array(dicomPart10AsArrayBuffer, pixelDataOffset);
        }
    }

    function getRescaleSlopeAndIntercept(dicomElements)
    {
        // NOTE - we default these to an identity transform since modality LUT
        // module is not required for all SOP Classes
        var result = {
            intercept : 0.0,
            slope: 1.0
        };

        var rescaleIntercept  = dicomElements.x00281052;
        var rescaleSlope  = dicomElements.x00281053;


        if(rescaleIntercept && rescaleIntercept.str.length > 0) {
            result.intercept = parseFloat(rescaleIntercept.str);
        }
        if(rescaleSlope && rescaleSlope.str.length > 0) {
            result.slope = parseFloat(rescaleSlope.str);
        }
        return result;
    }

    function getWindowWidthAndCenter(dicomElements)
    {
        // NOTE - Default these to undefined since they may not be present as
        // they are not present or required for all sop classes.  We leave it up
        // to a higher layer to determine reasonable default values for these
        // if they are not provided.  We also use the first ww/wc values if
        // there are multiple and again leave it up the higher levels to deal with
        // this
        var result = {
            windowCenter : undefined,
            windowWidth: undefined
        };

        var windowCenter  = dicomElements.x00281050;
        var windowWidth  = dicomElements.x00281051;

        if(windowCenter && windowCenter.str.length > 0) {
            var split = windowCenter.str.split('\\');
            result.windowCenter = parseFloat(split[0]);
        }
        if(windowWidth && windowWidth.str.length > 0) {
            var split = windowWidth.str.split('\\');
            result.windowWidth = parseFloat(split[0]);
        }
        return result;
    }

    function setMinMaxPixelValue(image)
    {
        // we always calculate the min max values since they are not always
        // present in DICOM and we don't want to trust them anyway as cornerstone
        // depends on us providing reliable values for these
        var min = 65535;
        var max = -32768;
        var numPixels = image.width * image.height;
        var pixelData = image.storedPixelData;
        for(var index = 0; index < numPixels; index++) {
            var spv = pixelData[index];
            // TODO: test to see if it is faster to use conditional here rather than calling min/max functions
            min = Math.min(min, spv);
            max = Math.max(max, spv);
        }

        image.minPixelValue = min;
        image.maxPixelValue = max;
    }

    function createImageObject(dicomPart10AsArrayBuffer)
    {
        // Parse the DICOM File
        var dicomElements = cornerstone.parseDicom(dicomPart10AsArrayBuffer);

        // extract the DICOM attributes we need
        var pixelSpacing = getPixelSpacing(dicomElements);
        var rows = dicomElements.x00280010.uint16;
        var columns = dicomElements.x00280010.uint16;
        var rescaleSlopeAndIntercept = getRescaleSlopeAndIntercept(dicomElements);
        var windowWidthAndCenter = getWindowWidthAndCenter(dicomElements);

        // Extract the various attributes we need
        var image = {
            minPixelValue : -32767, // calculated below
            maxPixelValue : 65535, // calculated below
            slope: rescaleSlopeAndIntercept.slope,
            intercept: rescaleSlopeAndIntercept.intercept,
            windowCenter : windowWidthAndCenter.windowCenter,
            windowWidth : windowWidthAndCenter.windowWidth,
            storedPixelData: extractStoredPixels(dicomElements, dicomPart10AsArrayBuffer),
            rows: rows,
            columns: columns,
            height: rows,
            width: columns,
            color: false,
            columnPixelSpacing: pixelSpacing.column,
            rowPixelSpacing: pixelSpacing.row,
            data: dicomElements
        };

        // TODO: deal with pixel padding and all of the various issues by setting it to min pixel value (or lower)
        // TODO: deal with MONOCHROME1 - either invert pixel data or add support to cornerstone
        // TODO: Add support for color by converting all formats to RGB
        // TODO: Mask out overlays embedded in pixel data above high bit

        setMinMaxPixelValue(image);

        return image;
    }

    // Loads an image given an imageId
    // wado url example:
    // http://localhost:3333/wado?requestType=WADO&studyUID=1.3.6.1.4.1.25403.166563008443.5076.20120418075541.1&seriesUID=1.3.6.1.4.1.25403.166563008443.5076.20120418075541.2&objectUID=1.3.6.1.4.1.25403.166563008443.5076.20120418075557.1&contentType=application%2Fdicom&transferSyntax=1.2.840.10008.1.2.1
    // NOTE: supposedly the instance will be returned in Explicit Little Endian transfer syntax if you don't
    // specify a transferSyntax but Osirix doesn't do this and seems to return it with the transfer syntax it is
    // stored as.
    function loadImage(imageId) {
        // create a deferred object
        // TODO: Consider not using jquery for deferred - maybe cujo's when library
        var deferred = $.Deferred();

        // Make the request for the DICOM data
        // TODO: consider using cujo's REST library here?
        var oReq = new XMLHttpRequest();
        oReq.open("get", imageId, true);
        oReq.responseType = "arraybuffer";
        oReq.onreadystatechange = function(oEvent) {
            // TODO: consider sending out progress messages here as we receive the pixel data
            if(oReq.readyState == 4 && oReq.status == 200) {
                // request succeeded, create an image object and resolve the deferred
                // TODO: do error handling here in case something goes wrong parsing the response
                var image = createImageObject(oReq.response);

                deferred.resolve(image);
            }
            // TODO: Check for errors and reject the deferred if they happened
            else {
                // request failed, reject the deferred
                //deferred.reject();
            }
        };
        oReq.send();

        return deferred;
    }

    // steam the http and https prefixes so we can use wado URL's directly
    cornerstone.registerImageLoader('http', loadImage);
    cornerstone.registerImageLoader('https', loadImage);

    return cornerstone;
}($, cornerstone));