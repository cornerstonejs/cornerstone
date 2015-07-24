/*! cornerstone - v0.8.1 - 2015-07-24 | (c) 2014 Chris Hafey | https://github.com/chafey/cornerstone */
if(typeof cornerstone === 'undefined'){
    cornerstone = {
        internal : {},
        rendering: {}
    };
}

(function (cornerstone) {

    "use strict";

    function disable(element) {
        if(element === undefined) {
            throw "disable: element element must not be undefined";
        }

        // Search for this element in this list of enabled elements
        var enabledElements = cornerstone.getEnabledElements();
        for(var i=0; i < enabledElements.length; i++) {
            if(enabledElements[i].element === element) {
                // We found it!

                // Fire an event so dependencies can cleanup
                var eventData = {
                    element : element
                };
                $(element).trigger("CornerstoneElementDisabled", eventData);

                // remove the child dom elements that we created (e.g.canvas)
                enabledElements[i].element.removeChild(enabledElements[i].canvas);

                // remove this element from the list of enabled elements
                enabledElements.splice(i, 1);
                return;
            }
        }
    }

    // module/private exports
    cornerstone.disable = disable;

}(cornerstone));
/**
 * This module is responsible for enabling an element to display images with cornerstone
 */
(function ($, cornerstone) {

    "use strict";

    /**
     * sets a new image object for a given element
     * @param element
     * @param image
     */
    function displayImage(element, image, viewport) {
        if(element === undefined) {
            throw "displayImage: parameter element cannot be undefined";
        }
        if(image === undefined) {
            throw "displayImage: parameter image cannot be undefined";
        }

        var enabledElement = cornerstone.getEnabledElement(element);

        enabledElement.image = image;

        if(enabledElement.viewport === undefined) {
            enabledElement.viewport = cornerstone.internal.getDefaultViewport(enabledElement.canvas, image);
        }

        // merge viewport
        if(viewport) {
            for(var attrname in viewport)
            {
                if(viewport[attrname] !== null) {
                    enabledElement.viewport[attrname] = viewport[attrname];
                }
            }
        }

        var now = new Date();
        var frameRate;
        if(enabledElement.lastImageTimeStamp !== undefined) {
            var timeSinceLastImage = now.getTime() - enabledElement.lastImageTimeStamp;
            frameRate = (1000 / timeSinceLastImage).toFixed();
        } else {
        }
        enabledElement.lastImageTimeStamp = now.getTime();

        var newImageEventData = {
            viewport : enabledElement.viewport,
            element : enabledElement.element,
            image : enabledElement.image,
            enabledElement : enabledElement,
            frameRate : frameRate
        };

        $(enabledElement.element).trigger("CornerstoneNewImage", newImageEventData);

        cornerstone.updateImage(element);
    }

    // module/private exports
    cornerstone.displayImage = displayImage;
}($, cornerstone));
/**
 * This module is responsible for immediately drawing an enabled element
 */

(function ($, cornerstone) {

    "use strict";

    /**
     * Immediately draws the enabled element
     *
     * @param element
     */
    function draw(element) {
        var enabledElement = cornerstone.getEnabledElement(element);

        if(enabledElement.image === undefined) {
            throw "draw: image has not been loaded yet";
        }

        cornerstone.drawImage(enabledElement);
    }

    // Module exports
    cornerstone.draw = draw;

}($, cornerstone));
/**
 * This module is responsible for drawing invalidated enabled elements
 */

(function ($, cornerstone) {

    "use strict";

    /**
     * Draws all invalidated enabled elements and clears the invalid flag after drawing it
     */
    function drawInvalidated()
    {
        var enabledElements = cornerstone.getEnabledElements();
        for(var i=0;i < enabledElements.length; i++) {
            var ee = enabledElements[i];
            if(ee.invalid === true) {
                cornerstone.drawImage(ee);
            }
        }
    }

    // Module exports
    cornerstone.drawInvalidated = drawInvalidated;
}($, cornerstone));
/**
 * This module is responsible for enabling an element to display images with cornerstone
 */
(function (cornerstone) {

    "use strict";

    function enable(element) {
        if(element === undefined) {
            throw "enable: parameter element cannot be undefined";
        }

        var canvas = document.createElement('canvas');
        element.appendChild(canvas);

        var el = {
            element: element,
            canvas: canvas,
            image : undefined, // will be set once image is loaded
            invalid: false, // true if image needs to be drawn, false if not
            data : {}
        };
        cornerstone.addEnabledElement(el);

        cornerstone.resize(element, true);

        return element;
    }

    // module/private exports
    cornerstone.enable = enable;
}(cornerstone));
(function (cornerstone) {

    "use strict";

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

}(cornerstone));
(function (cornerstone) {

    "use strict";

    var enabledElements = [];

    function getEnabledElement(element) {
        if(element === undefined) {
            throw "getEnabledElement: parameter element must not be undefined";
        }
        for(var i=0; i < enabledElements.length; i++) {
            if(enabledElements[i].element == element) {
                return enabledElements[i];
            }
        }

        throw "element not enabled";
    }

    function addEnabledElement(enabledElement) {
        if(enabledElement === undefined) {
            throw "getEnabledElement: enabledElement element must not be undefined";
        }

        enabledElements.push(enabledElement);
    }

    function getEnabledElementsByImageId(imageId) {
        var ees = [];
        enabledElements.forEach(function(enabledElement) {
            if(enabledElement.image && enabledElement.image.imageId === imageId) {
                ees.push(enabledElement);
            }
        });
        return ees;
    }

    function getEnabledElements() {
        return enabledElements;
    }

    // module/private exports
    cornerstone.getEnabledElement = getEnabledElement;
    cornerstone.addEnabledElement = addEnabledElement;
    cornerstone.getEnabledElementsByImageId = getEnabledElementsByImageId;
    cornerstone.getEnabledElements = getEnabledElements;
}(cornerstone));
/**
 * This module will fit an image to fit inside the canvas displaying it such that all pixels
 * in the image are viewable
 */
(function (cornerstone) {

    "use strict";

    /**
     * Adjusts an images scale and center so the image is centered and completely visible
     * @param element
     */
    function fitToWindow(element)
    {
        var enabledElement = cornerstone.getEnabledElement(element);
        var defaultViewport = cornerstone.internal.getDefaultViewport(enabledElement.canvas, enabledElement.image);
        enabledElement.viewport.scale = defaultViewport.scale;
        enabledElement.viewport.translation.x = defaultViewport.translation.x;
        enabledElement.viewport.translation.y = defaultViewport.translation.y;
        enabledElement.viewport.rotation = defaultViewport.rotation;
        enabledElement.viewport.hflip = defaultViewport.hflip;
        enabledElement.viewport.vflip = defaultViewport.vflip;
        cornerstone.updateImage(element);
    }

    cornerstone.fitToWindow = fitToWindow;
}(cornerstone));

/**
 * This file is responsible for returning the default viewport for an image
 */

(function ($, cornerstone) {

    "use strict";

    /**
     * returns a default viewport for display the specified image on the specified
     * enabled element.  The default viewport is fit to window
     *
     * @param element
     * @param image
     */
    function getDefaultViewportForImage(element, image) {
        var enabledElement = cornerstone.getEnabledElement(element);
        var viewport = cornerstone.internal.getDefaultViewport(enabledElement.canvas, image);
        return viewport;
    }

    // Module exports
    cornerstone.getDefaultViewportForImage = getDefaultViewportForImage;
}($, cornerstone));
/**
 * This module is responsible for returning the currently displayed image for an element
 */

(function ($, cornerstone) {

    "use strict";

    /**
     * returns the currently displayed image for an element or undefined if no image has
     * been displayed yet
     *
     * @param element
     */
    function getImage(element) {
        var enabledElement = cornerstone.getEnabledElement(element);
        return enabledElement.image;
    }

    // Module exports
    cornerstone.getImage = getImage;
}($, cornerstone));
/**
 * This module returns a subset of the stored pixels of an image
 */
(function (cornerstone) {

    "use strict";


    /**
     * Returns array of pixels with modality LUT transformation applied
     */
    function getPixels(element, x, y, width, height) {

        var storedPixels = cornerstone.getStoredPixels(element, x, y, width, height);
        var ee = cornerstone.getEnabledElement(element);
        var slope = ee.image.slope;
        var intercept = ee.image.intercept;

        var modalityPixels = storedPixels.map(function(pixel){
            return pixel * slope + intercept;
        });

        return modalityPixels;
    }

    // module exports
    cornerstone.getPixels = getPixels;
}(cornerstone));
/**
 * This module returns a subset of the stored pixels of an image
 */
(function (cornerstone) {

    "use strict";

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
        if(element === undefined) {
            throw "getStoredPixels: parameter element must not be undefined";
        }

        x = Math.round(x);
        y = Math.round(y);
        var ee = cornerstone.getEnabledElement(element);
        var storedPixels = [];
        var index = 0;
        var pixelData = ee.image.getPixelData();
        for(var row=0; row < height; row++) {
            for(var column=0; column < width; column++) {
                var spIndex = ((row + y) * ee.image.columns) + (column + x);
                storedPixels[index++] = pixelData[spIndex];
            }
        }
        return storedPixels;
    }

    // module exports
    cornerstone.getStoredPixels = getStoredPixels;
}(cornerstone));
/**
 * This module contains functions to deal with getting and setting the viewport for an enabled element
 */
(function (cornerstone) {

    "use strict";

    /**
     * Returns the viewport for the specified enabled element
     * @param element
     * @returns {*}
     */
    function getViewport(element) {
        var enabledElement = cornerstone.getEnabledElement(element);

        var viewport = enabledElement.viewport;
        if(viewport === undefined) {
            return undefined;
        }
        return {
            scale : viewport.scale,
            translation : {
                x : viewport.translation.x,
                y : viewport.translation.y
            },
            voi : {
                windowWidth: viewport.voi.windowWidth,
                windowCenter : viewport.voi.windowCenter
            },
            invert : viewport.invert,
            pixelReplication: viewport.pixelReplication,
            rotation: viewport.rotation, 
            hflip: viewport.hflip,
            vflip: viewport.vflip
        };
    }

    // module/private exports
    cornerstone.getViewport = getViewport;

}(cornerstone));

/**
 * This module deals with caching images
 */

(function (cornerstone) {

    "use strict";

    var imageCache = {
    };

    var cachedImages = [];

    var maximumSizeInBytes = 1024 * 1024 * 1024; // 1 GB
    var cacheSizeInBytes = 0;

    function setMaximumSizeBytes(numBytes)
    {
        if(numBytes === undefined) {
            throw "setMaximumSizeBytes: parameter numBytes must not be undefined";
        }
        if(numBytes.toFixed === undefined) {
            throw "setMaximumSizeBytes: parameter numBytes must be a number";
        }

        maximumSizeInBytes = numBytes;
        purgeCacheIfNecessary();
    }

    function purgeCacheIfNecessary()
    {
        // if max cache size has not been exceeded, do nothing
        if(cacheSizeInBytes <= maximumSizeInBytes)
        {
            return;
        }

        // cache size has been exceeded, create list of images sorted by timeStamp
        // so we can purge the least recently used image
        function compare(a,b) {
            if(a.timeStamp > b.timeStamp) {
                return -1;
            }
            if(a.timeStamp < b.timeStamp) {
                return 1;
            }
            return 0;
        }
        cachedImages.sort(compare);

        // remove images as necessary
        while(cacheSizeInBytes > maximumSizeInBytes)
        {
            var lastCachedImage = cachedImages[cachedImages.length - 1];
            cacheSizeInBytes -= lastCachedImage.sizeInBytes;
            delete imageCache[lastCachedImage.imageId];
            lastCachedImage.imagePromise.reject();
            cachedImages.pop();
        }
    }

    function putImagePromise(imageId, imagePromise) {
        if(imageId === undefined)
        {
            throw "getImagePromise: imageId must not be undefined";
        }
        if(imagePromise === undefined)
        {
            throw "getImagePromise: imagePromise must not be undefined";
        }

        if(imageCache.hasOwnProperty(imageId) === true) {
            throw "putImagePromise: imageId already in cache";
        }

        var cachedImage = {
            loaded : false,
            imageId : imageId,
            imagePromise : imagePromise,
            timeStamp : new Date(),
            sizeInBytes: 0
        };

        imageCache[imageId] = cachedImage;
        cachedImages.push(cachedImage);

        imagePromise.then(function(image) {
            cachedImage.loaded = true;

            if(image.sizeInBytes === undefined)
            {
                throw "putImagePromise: image does not have sizeInBytes property or";
            }
            if(image.sizeInBytes.toFixed === undefined) {
                throw "putImagePromise: image.sizeInBytes is not a number";
            }
            cachedImage.sizeInBytes = image.sizeInBytes;
            cacheSizeInBytes += cachedImage.sizeInBytes;
            purgeCacheIfNecessary();
        });
    }

    function getImagePromise(imageId) {
        if(imageId === undefined)
        {
            throw "getImagePromise: imageId must not be undefined";
        }
        var cachedImage = imageCache[imageId];
        if(cachedImage === undefined) {
            return undefined;
        }

        // bump time stamp for cached image
        cachedImage.timeStamp = new Date();
        return cachedImage.imagePromise;
    }

    function removeImagePromise(imageId) {
        if(imageId === undefined) {
            throw "removeImagePromise: imageId must not be undefined";
        }
        var cachedImage = imageCache[imageId];
        if(cachedImage === undefined) {
            throw "removeImagePromise: imageId must not be undefined";
        }
        cachedImages.splice( cachedImages.indexOf(cachedImage), 1);
        cacheSizeInBytes -= cachedImage.sizeInBytes;
        delete imageCache[imageId];

        return cachedImage.imagePromise;
    }

    function getCacheInfo() {
        return {
            maximumSizeInBytes : maximumSizeInBytes,
            cacheSizeInBytes : cacheSizeInBytes,
            numberOfImagesCached: cachedImages.length
        };
    }

    function purgeCache() {
        while (cachedImages.length > 0) {
            var removedCachedImage = cachedImages.pop();
            delete imageCache[removedCachedImage.imageId];
            removedCachedImage.imagePromise.reject();
        }
        cacheSizeInBytes = 0;
    }

    // module exports

    cornerstone.imageCache = {
        putImagePromise : putImagePromise,
        getImagePromise: getImagePromise,
        removeImagePromise: removeImagePromise,
        setMaximumSizeBytes: setMaximumSizeBytes,
        getCacheInfo : getCacheInfo,
        purgeCache: purgeCache
    };
}(cornerstone));

/**
 * This module deals with ImageLoaders, loading images and caching images
 */

(function ($, cornerstone) {

    "use strict";

    var imageLoaders = {};

    var unknownImageLoader;

    function loadImageFromImageLoader(imageId) {
        var colonIndex = imageId.indexOf(":");
        var scheme = imageId.substring(0, colonIndex);
        var loader = imageLoaders[scheme];
        var imagePromise;
        if(loader === undefined || loader === null) {
            if(unknownImageLoader !== undefined) {
                imagePromise = unknownImageLoader(imageId);
                return imagePromise;
            }
            else {
                return undefined;
            }
        }
        imagePromise = loader(imageId);

        // broadcast an image loaded event once the image is loaded
        // This is based on the idea here: http://stackoverflow.com/questions/3279809/global-custom-events-in-jquery
        imagePromise.then(function(image) {
            $(cornerstone).trigger('CornerstoneImageLoaded', {image: image});
        });

        return imagePromise;
    }

    // Loads an image given an imageId and returns a promise which will resolve
    // to the loaded image object or fail if an error occurred.  The loaded image
    // is not stored in the cache
    function loadImage(imageId) {
        if(imageId === undefined) {
            throw "loadImage: parameter imageId must not be undefined";
        }

        var imagePromise = cornerstone.imageCache.getImagePromise(imageId);
        if(imagePromise !== undefined) {
            return imagePromise;
        }

        imagePromise = loadImageFromImageLoader(imageId);
        if(imagePromise === undefined) {
            throw "loadImage: no image loader for imageId";
        }

        return imagePromise;
    }

    // Loads an image given an imageId and returns a promise which will resolve
    // to the loaded image object or fail if an error occurred.  The image is
    // stored in the cache
    function loadAndCacheImage(imageId) {
        if(imageId === undefined) {
            throw "loadAndCacheImage: parameter imageId must not be undefined";
        }

        var imagePromise = cornerstone.imageCache.getImagePromise(imageId);
        if(imagePromise !== undefined) {
            return imagePromise;
        }

        imagePromise = loadImageFromImageLoader(imageId);
        if(imagePromise === undefined) {
            throw "loadAndCacheImage: no image loader for imageId";
        }

        cornerstone.imageCache.putImagePromise(imageId, imagePromise);

        return imagePromise;
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
    cornerstone.loadAndCacheImage = loadAndCacheImage;
    cornerstone.registerImageLoader = registerImageLoader;
    cornerstone.registerUnknownImageLoader = registerUnknownImageLoader;

}($, cornerstone));

(function (cornerstone) {

    "use strict";

    function calculateTransform(enabledElement, scale) {

        var transform = new cornerstone.internal.Transform();
        transform.translate(enabledElement.canvas.width/2, enabledElement.canvas.height / 2);

        //Apply the rotation before scaling for non square pixels
        var angle = enabledElement.viewport.rotation;
        if(angle!==0) {
            transform.rotate(angle*Math.PI/180);
        }

        // apply the scale
        var widthScale = enabledElement.viewport.scale;
        var heightScale = enabledElement.viewport.scale;
        if(enabledElement.image.rowPixelSpacing < enabledElement.image.columnPixelSpacing) {
            widthScale = widthScale * (enabledElement.image.columnPixelSpacing / enabledElement.image.rowPixelSpacing);
        }
        else if(enabledElement.image.columnPixelSpacing < enabledElement.image.rowPixelSpacing) {
            heightScale = heightScale * (enabledElement.image.rowPixelSpacing / enabledElement.image.columnPixelSpacing);
        }
        transform.scale(widthScale, heightScale);

        // unrotate to so we can translate unrotated
        if(angle!==0) {
            transform.rotate(-angle*Math.PI/180);
        }

        // apply the pan offset
        transform.translate(enabledElement.viewport.translation.x, enabledElement.viewport.translation.y);

        // rotate again so we can apply general scale
        if(angle!==0) {
            transform.rotate(angle*Math.PI/180);
        }

        if(scale !== undefined) {
            // apply the font scale
            transform.scale(scale, scale);
        }

        //Apply Flip if required
        if(enabledElement.viewport.hflip) {
            transform.scale(-1,1);
        }

        if(enabledElement.viewport.vflip) {
            transform.scale(1,-1);
        }

        // translate the origin back to the corner of the image so the event handlers can draw in image coordinate system
        transform.translate(-enabledElement.image.width / 2 , -enabledElement.image.height/ 2);
        return transform;
    }

    // Module exports
    cornerstone.internal.calculateTransform = calculateTransform;
}(cornerstone));
/**
 * This module is responsible for drawing an image to an enabled elements canvas element
 */

(function ($, cornerstone) {

    "use strict";

    /**
     * Internal API function to draw an image to a given enabled element
     * @param enabledElement
     * @param invalidated - true if pixel data has been invalidated and cached rendering should not be used
     */
    function drawImage(enabledElement, invalidated) {

        var start = new Date();

        enabledElement.image.render(enabledElement, invalidated);

        var context = enabledElement.canvas.getContext('2d');

        var end = new Date();
        var diff = end - start;
        //console.log(diff + ' ms');

        var eventData = {
            viewport : enabledElement.viewport,
            element : enabledElement.element,
            image : enabledElement.image,
            enabledElement : enabledElement,
            canvasContext: context,
            renderTimeInMs : diff
        };

        $(enabledElement.element).trigger("CornerstoneImageRendered", eventData);
        enabledElement.invalid = false;
    }

    // Module exports
    cornerstone.internal.drawImage = drawImage;
    cornerstone.drawImage = drawImage;

}($, cornerstone));
/**
 * This module generates a lut for an image
 */

(function (cornerstone) {

    "use strict";

    /**
     * Creates a LUT used while rendering to convert stored pixel values to
     * display pixels
     *
     * @param image
     * @returns {Array}
     */
    function generateLut(image, windowWidth, windowCenter, invert)
    {
        if(image.lut === undefined) {
            image.lut =  new Int16Array(image.maxPixelValue - Math.min(image.minPixelValue,0)+1);
        }
        var lut = image.lut;

        var maxPixelValue = image.maxPixelValue;
        var minPixelValue = image.minPixelValue;
        var slope = image.slope;
        var intercept = image.intercept;
        var localWindowWidth = windowWidth;
        var localWindowCenter = windowCenter;

        var modalityLutValue;
        var voiLutValue;
        var clampedValue;
        var storedValue;

        // NOTE: As of Nov 2014, most javascript engines have lower performance when indexing negative indexes.
        // We improve performance by offsetting the pixel values for signed data to avoid negative indexes
        // when generating the lut and then undo it in storedPixelDataToCanvasImagedata.  Thanks to @jpambrun
        // for this contribution!

        var offset = 0;
        if(minPixelValue < 0) {
            offset = minPixelValue;
        }

        if(invert === true) {
            for(storedValue = image.minPixelValue; storedValue <= maxPixelValue; storedValue++)
            {
                modalityLutValue = storedValue * slope + intercept;
                voiLutValue = (((modalityLutValue - (localWindowCenter)) / (localWindowWidth) + 0.5) * 255.0);
                clampedValue = Math.min(Math.max(voiLutValue, 0), 255);
                lut[storedValue + (-offset)] = Math.round(255 - clampedValue);
            }
        }
        else {
            for(storedValue = image.minPixelValue; storedValue <= maxPixelValue; storedValue++)
            {
                modalityLutValue = storedValue * slope + intercept;
                voiLutValue = (((modalityLutValue - (localWindowCenter)) / (localWindowWidth) + 0.5) * 255.0);
                clampedValue = Math.min(Math.max(voiLutValue, 0), 255);
                lut[storedValue+ (-offset)] = Math.round(clampedValue);
            }
        }
    }


    // Module exports
    cornerstone.internal.generateLut = generateLut;
    cornerstone.generateLut = generateLut;
}(cornerstone));

/**
 * This module contains a function to get a default viewport for an image given
 * a canvas element to display it in
 *
 */
(function (cornerstone) {

    "use strict";

    /**
     * Creates a new viewport object containing default values for the image and canvas
     * @param canvas
     * @param image
     * @returns viewport object
     */
    function getDefaultViewport(canvas, image) {
        if(canvas === undefined) {
            throw "getDefaultViewport: parameter canvas must not be undefined";
        }
        if(image === undefined) {
            throw "getDefaultViewport: parameter image must not be undefined";
        }
        var viewport = {
            scale : 1.0,
            translation : {
                x : 0,
                y : 0
            },
            voi : {
                windowWidth: image.windowWidth,
                windowCenter: image.windowCenter,
            },
            invert: image.invert,
            pixelReplication: false,
            rotation: 0,
            hflip: false,
            vflip: false
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
    cornerstone.internal.getDefaultViewport = getDefaultViewport;
    cornerstone.getDefaultViewport = getDefaultViewport;
}(cornerstone));

(function (cornerstone) {

    "use strict";

    function getTransform(enabledElement)
    {
        // For now we will calculate it every time it is requested.  In the future, we may want to cache
        // it in the enabled element to speed things up
        var transform = cornerstone.internal.calculateTransform(enabledElement);
        return transform;
    }

    // Module exports
    cornerstone.internal.getTransform = getTransform;

}(cornerstone));
/**
 * This module is responsible for drawing an image to an enabled elements canvas element
 */

(function ($, cornerstone) {

    "use strict";

    cornerstone.drawImage = cornerstone.internal.drawImage;
    cornerstone.generateLut = cornerstone.internal.generateLut;
    cornerstone.storedPixelDataToCanvasImageData = cornerstone.internal.storedPixelDataToCanvasImageData;
    cornerstone.storedColorPixelDataToCanvasImageData = cornerstone.internal.storedColorPixelDataToCanvasImageData;

}($, cornerstone));
/**
 * This module contains a function to convert stored pixel values to display pixel values using a LUT
 */
(function (cornerstone) {

    "use strict";

    function storedColorPixelDataToCanvasImageData(image, lut, canvasImageDataData)
    {
        var minPixelValue = image.minPixelValue;
        var canvasImageDataIndex = 0;
        var storedPixelDataIndex = 0;
        var numPixels = image.width * image.height * 4;
        var storedPixelData = image.getPixelData();
        var localLut = lut;
        var localCanvasImageDataData = canvasImageDataData;
        // NOTE: As of Nov 2014, most javascript engines have lower performance when indexing negative indexes.
        // We have a special code path for this case that improves performance.  Thanks to @jpambrun for this enhancement
        if(minPixelValue < 0){
            while(storedPixelDataIndex < numPixels) {
                localCanvasImageDataData[canvasImageDataIndex++] = localLut[storedPixelData[storedPixelDataIndex++] + (-minPixelValue)]; // red
                localCanvasImageDataData[canvasImageDataIndex++] = localLut[storedPixelData[storedPixelDataIndex++] + (-minPixelValue)]; // green
                localCanvasImageDataData[canvasImageDataIndex] = localLut[storedPixelData[storedPixelDataIndex] + (-minPixelValue)]; // blue
                storedPixelDataIndex+=2;
                canvasImageDataIndex+=2;
            }
        }else{
            while(storedPixelDataIndex < numPixels) {
                localCanvasImageDataData[canvasImageDataIndex++] = localLut[storedPixelData[storedPixelDataIndex++]]; // red
                localCanvasImageDataData[canvasImageDataIndex++] = localLut[storedPixelData[storedPixelDataIndex++]]; // green
                localCanvasImageDataData[canvasImageDataIndex] = localLut[storedPixelData[storedPixelDataIndex]]; // blue
                storedPixelDataIndex+=2;
                canvasImageDataIndex+=2;
            }
        }
    }

    // Module exports
    cornerstone.internal.storedColorPixelDataToCanvasImageData = storedColorPixelDataToCanvasImageData;
    cornerstone.storedColorPixelDataToCanvasImageData = storedColorPixelDataToCanvasImageData;

}(cornerstone));

/**
 * This module contains a function to convert stored pixel values to display pixel values using a LUT
 */
(function (cornerstone) {

    "use strict";

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
     * @param pixelData the pixel data
     * @param lut the lut
     * @param canvasImageDataData a canvasImgageData.data buffer filled with white pixels
     */
    function storedPixelDataToCanvasImageData(image, lut, canvasImageDataData)
    {
        var pixelData = image.getPixelData();
        var minPixelValue = image.minPixelValue;
        var canvasImageDataIndex = 3;
        var storedPixelDataIndex = 0;
        var localNumPixels = pixelData.length;
        var localPixelData = pixelData;
        var localLut = lut;
        var localCanvasImageDataData = canvasImageDataData;
        // NOTE: As of Nov 2014, most javascript engines have lower performance when indexing negative indexes.
        // We have a special code path for this case that improves performance.  Thanks to @jpambrun for this enhancement
        if(minPixelValue < 0){
            while(storedPixelDataIndex < localNumPixels) {
                localCanvasImageDataData[canvasImageDataIndex] = localLut[localPixelData[storedPixelDataIndex++] + (-minPixelValue)]; // alpha
                canvasImageDataIndex += 4;
            }
        }else{
            while(storedPixelDataIndex < localNumPixels) {
                localCanvasImageDataData[canvasImageDataIndex] = localLut[localPixelData[storedPixelDataIndex++]]; // alpha
                canvasImageDataIndex += 4;
            }
        }
    }

    // Module exports
    cornerstone.internal.storedPixelDataToCanvasImageData = storedPixelDataToCanvasImageData;
    cornerstone.storedPixelDataToCanvasImageData = storedPixelDataToCanvasImageData;

}(cornerstone));

// Last updated November 2011
// By Simon Sarris
// www.simonsarris.com
// sarris@acm.org
//
// Free to use and distribute at will
// So long as you are nice to people, etc

// Simple class for keeping track of the current transformation matrix

// For instance:
//    var t = new Transform();
//    t.rotate(5);
//    var m = t.m;
//    ctx.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);

// Is equivalent to:
//    ctx.rotate(5);

// But now you can retrieve it :)

(function (cornerstone) {

    "use strict";


    // Remember that this does not account for any CSS transforms applied to the canvas
    function Transform() {
        this.reset();
    }

    Transform.prototype.reset = function() {
        this.m = [1,0,0,1,0,0];
    };

    Transform.prototype.clone = function() {
        var transform = new Transform();
        transform.m[0] = this.m[0];
        transform.m[1] = this.m[1];
        transform.m[2] = this.m[2];
        transform.m[3] = this.m[3];
        transform.m[4] = this.m[4];
        transform.m[5] = this.m[5];
        return transform;
    };


    Transform.prototype.multiply = function(matrix) {
        var m11 = this.m[0] * matrix.m[0] + this.m[2] * matrix.m[1];
        var m12 = this.m[1] * matrix.m[0] + this.m[3] * matrix.m[1];

        var m21 = this.m[0] * matrix.m[2] + this.m[2] * matrix.m[3];
        var m22 = this.m[1] * matrix.m[2] + this.m[3] * matrix.m[3];

        var dx = this.m[0] * matrix.m[4] + this.m[2] * matrix.m[5] + this.m[4];
        var dy = this.m[1] * matrix.m[4] + this.m[3] * matrix.m[5] + this.m[5];

        this.m[0] = m11;
        this.m[1] = m12;
        this.m[2] = m21;
        this.m[3] = m22;
        this.m[4] = dx;
        this.m[5] = dy;
    };

    Transform.prototype.invert = function() {
        var d = 1 / (this.m[0] * this.m[3] - this.m[1] * this.m[2]);
        var m0 = this.m[3] * d;
        var m1 = -this.m[1] * d;
        var m2 = -this.m[2] * d;
        var m3 = this.m[0] * d;
        var m4 = d * (this.m[2] * this.m[5] - this.m[3] * this.m[4]);
        var m5 = d * (this.m[1] * this.m[4] - this.m[0] * this.m[5]);
        this.m[0] = m0;
        this.m[1] = m1;
        this.m[2] = m2;
        this.m[3] = m3;
        this.m[4] = m4;
        this.m[5] = m5;
    };

    Transform.prototype.rotate = function(rad) {
        var c = Math.cos(rad);
        var s = Math.sin(rad);
        var m11 = this.m[0] * c + this.m[2] * s;
        var m12 = this.m[1] * c + this.m[3] * s;
        var m21 = this.m[0] * -s + this.m[2] * c;
        var m22 = this.m[1] * -s + this.m[3] * c;
        this.m[0] = m11;
        this.m[1] = m12;
        this.m[2] = m21;
        this.m[3] = m22;
    };

    Transform.prototype.translate = function(x, y) {
        this.m[4] += this.m[0] * x + this.m[2] * y;
        this.m[5] += this.m[1] * x + this.m[3] * y;
    };

    Transform.prototype.scale = function(sx, sy) {
        this.m[0] *= sx;
        this.m[1] *= sx;
        this.m[2] *= sy;
        this.m[3] *= sy;
    };

    Transform.prototype.transformPoint = function(px, py) {
        var x = px;
        var y = py;
        px = x * this.m[0] + y * this.m[2] + this.m[4];
        py = x * this.m[1] + y * this.m[3] + this.m[5];
        return {x: px, y: py};
    };

    cornerstone.internal.Transform = Transform;
}(cornerstone));
/**
 * This module contains a function to make an image is invalid
 */
(function (cornerstone) {

    "use strict";

    /**
     * Sets the invalid flag on the enabled element and fire an event
     * @param element
     */
    function invalidate(element) {
        var enabledElement = cornerstone.getEnabledElement(element);
        enabledElement.invalid = true;
        var eventData = {
            element: element
        };
        $(enabledElement.element).trigger("CornerstoneInvalidated", eventData);
    }

    // module exports
    cornerstone.invalidate = invalidate;
}(cornerstone));
/**
 * This module contains a function to immediately invalidate an image
 */
(function (cornerstone) {

    "use strict";

    /**
     * Forces the image to be updated/redrawn for the specified enabled element
     * @param element
     */
    function invalidateImageId(imageId) {

        var enabledElements = cornerstone.getEnabledElementsByImageId(imageId);
        enabledElements.forEach(function(enabledElement) {
            cornerstone.drawImage(enabledElement, true);
        });
    }

    // module exports
    cornerstone.invalidateImageId = invalidateImageId;
}(cornerstone));
/**
 * This module contains a helper function to covert page coordinates to pixel coordinates
 */
(function (cornerstone) {

    "use strict";

    /**
     * Converts a point in the page coordinate system to the pixel coordinate
     * system
     * @param element
     * @param pageX
     * @param pageY
     * @returns {{x: number, y: number}}
     */
    function pageToPixel(element, pageX, pageY) {
        var enabledElement = cornerstone.getEnabledElement(element);

        if(enabledElement.image === undefined) {
            throw "image has not been loaded yet";
        }

        var image = enabledElement.image;

        // convert the pageX and pageY to the canvas client coordinates
        var rect = element.getBoundingClientRect();
        var clientX = pageX - rect.left - window.pageXOffset;
        var clientY = pageY - rect.top - window.pageYOffset;

        var pt = {x: clientX, y: clientY};
        var transform = cornerstone.internal.getTransform(enabledElement);
        transform.invert();
        return transform.transformPoint(pt.x, pt.y);
    }

    // module/private exports
    cornerstone.pageToPixel = pageToPixel;

}(cornerstone));

(function (cornerstone) {

    "use strict";

    /**
     * Converts a point in the pixel coordinate system to the canvas coordinate system
     * system.  This can be used to render using canvas context without having the weird
     * side effects that come from scaling and non square pixels
     * @param element
     * @param pt
     * @returns {x: number, y: number}
     */
    function pixelToCanvas(element, pt) {
        var enabledElement = cornerstone.getEnabledElement(element);
        var transform = cornerstone.internal.getTransform(enabledElement);
        return transform.transformPoint(pt.x, pt.y);
    }

    // module/private exports
    cornerstone.pixelToCanvas = pixelToCanvas;

}(cornerstone));

/**
 * This module is responsible for drawing an image to an enabled elements canvas element
 */

(function (cornerstone) {

    "use strict";

    var colorRenderCanvas = document.createElement('canvas');
    var colorRenderCanvasContext;
    var colorRenderCanvasData;

    var lastRenderedImageId;
    var lastRenderedViewport = {};

    function initializeColorRenderCanvas(image)
    {
        // Resize the canvas
        colorRenderCanvas.width = image.width;
        colorRenderCanvas.height = image.height;

        // get the canvas data so we can write to it directly
        colorRenderCanvasContext = colorRenderCanvas.getContext('2d');
        colorRenderCanvasContext.fillStyle = 'white';
        colorRenderCanvasContext.fillRect(0,0, colorRenderCanvas.width, colorRenderCanvas.height);
        colorRenderCanvasData = colorRenderCanvasContext.getImageData(0,0,image.width, image.height);
    }


    function getLut(image, viewport)
    {
        // if we have a cached lut and it has the right values, return it immediately
        if(image.lut !== undefined &&
            image.lut.windowCenter === viewport.voi.windowCenter &&
            image.lut.windowWidth === viewport.voi.windowWidth &&
            image.lut.invert === viewport.invert) {
            return image.lut;
        }

        // lut is invalid or not present, regenerate it and cache it
        cornerstone.generateLut(image, viewport.voi.windowWidth, viewport.voi.windowCenter, viewport.invert);
        image.lut.windowWidth = viewport.voi.windowWidth;
        image.lut.windowCenter = viewport.voi.windowCenter;
        image.lut.invert = viewport.invert;
        return image.lut;
    }

    function doesImageNeedToBeRendered(enabledElement, image)
    {
        if(image.imageId !== lastRenderedImageId ||
            lastRenderedViewport.windowCenter !== enabledElement.viewport.voi.windowCenter ||
            lastRenderedViewport.windowWidth !== enabledElement.viewport.voi.windowWidth ||
            lastRenderedViewport.invert !== enabledElement.viewport.invert ||
            lastRenderedViewport.rotation !== enabledElement.viewport.rotation ||  
            lastRenderedViewport.hflip !== enabledElement.viewport.hflip ||
            lastRenderedViewport.vflip !== enabledElement.viewport.vflip
            )
        {
            return true;
        }

        return false;
    }

    function getRenderCanvas(enabledElement, image, invalidated)
    {
        // apply the lut to the stored pixel data onto the render canvas

        if(enabledElement.viewport.voi.windowWidth === enabledElement.image.windowWidth &&
            enabledElement.viewport.voi.windowCenter === enabledElement.image.windowCenter &&
            enabledElement.viewport.invert === false)
        {
            // the color image voi/invert has not been modified, request the canvas that contains
            // it so we can draw it directly to the display canvas
            return image.getCanvas();
        }
        else
        {
            if(doesImageNeedToBeRendered(enabledElement, image) === false && invalidated !== true) {
                return colorRenderCanvas;
            }

            // If our render canvas does not match the size of this image reset it
            // NOTE: This might be inefficient if we are updating multiple images of different
            // sizes frequently.
            if(colorRenderCanvas.width !== image.width || colorRenderCanvas.height != image.height) {
                initializeColorRenderCanvas(image);
            }

            // get the lut to use
            var colorLut = getLut(image, enabledElement.viewport);

            // the color image voi/invert has been modified - apply the lut to the underlying
            // pixel data and put it into the renderCanvas
            cornerstone.storedColorPixelDataToCanvasImageData(image, colorLut, colorRenderCanvasData.data);
            colorRenderCanvasContext.putImageData(colorRenderCanvasData, 0, 0);
            return colorRenderCanvas;
        }
    }

    /**
     * API function to render a color image to an enabled element
     * @param enabledElement
     * @param invalidated - true if pixel data has been invaldiated and cached rendering should not be used
     */
    function renderColorImage(enabledElement, invalidated) {

        if(enabledElement === undefined) {
            throw "drawImage: enabledElement parameter must not be undefined";
        }
        var image = enabledElement.image;
        if(image === undefined) {
            throw "drawImage: image must be loaded before it can be drawn";
        }

        // get the canvas context and reset the transform
        var context = enabledElement.canvas.getContext('2d');
        context.setTransform(1, 0, 0, 1, 0, 0);

        // clear the canvas
        context.fillStyle = 'black';
        context.fillRect(0,0, enabledElement.canvas.width, enabledElement.canvas.height);

        // turn off image smooth/interpolation if pixelReplication is set in the viewport
        if(enabledElement.viewport.pixelReplication === true) {
            context.imageSmoothingEnabled = false;
            context.mozImageSmoothingEnabled = false; // firefox doesn't support imageSmoothingEnabled yet
        }
        else {
            context.imageSmoothingEnabled = true;
            context.mozImageSmoothingEnabled = true;
        }

        // save the canvas context state and apply the viewport properties
        context.save();
        cornerstone.setToPixelCoordinateSystem(enabledElement, context);

        var renderCanvas = getRenderCanvas(enabledElement, image, invalidated);

        context.drawImage(renderCanvas, 0,0, image.width, image.height, 0, 0, image.width, image.height);

        context.restore();

        lastRenderedImageId = image.imageId;
        lastRenderedViewport.windowCenter = enabledElement.viewport.voi.windowCenter;
        lastRenderedViewport.windowWidth = enabledElement.viewport.voi.windowWidth;
        lastRenderedViewport.invert = enabledElement.viewport.invert;
        lastRenderedViewport.rotation = enabledElement.viewport.rotation;
        lastRenderedViewport.hflip = enabledElement.viewport.hflip;
        lastRenderedViewport.vflip = enabledElement.viewport.vflip;
    }

    // Module exports
    cornerstone.rendering.colorImage = renderColorImage;
    cornerstone.renderColorImage = renderColorImage;
}(cornerstone));

/**
 * This module is responsible for drawing a grayscale image
 */

(function (cornerstone) {

    "use strict";

    var grayscaleRenderCanvas = document.createElement('canvas');
    var grayscaleRenderCanvasContext;
    var grayscaleRenderCanvasData;

    var lastRenderedImageId;
    var lastRenderedViewport = {};

    function initializeGrayscaleRenderCanvas(image)
    {
        // Resize the canvas
        grayscaleRenderCanvas.width = image.width;
        grayscaleRenderCanvas.height = image.height;

        // NOTE - we need to fill the render canvas with white pixels since we control the luminance
        // using the alpha channel to improve rendering performance.
        grayscaleRenderCanvasContext = grayscaleRenderCanvas.getContext('2d');
        grayscaleRenderCanvasContext.fillStyle = 'white';
        grayscaleRenderCanvasContext.fillRect(0,0, grayscaleRenderCanvas.width, grayscaleRenderCanvas.height);
        grayscaleRenderCanvasData = grayscaleRenderCanvasContext.getImageData(0,0,image.width, image.height);
    }

    function getLut(image, viewport, invalidated)
    {
        // if we have a cached lut and it has the right values, return it immediately
        if(image.lut !== undefined &&
            image.lut.windowCenter === viewport.voi.windowCenter &&
            image.lut.windowWidth === viewport.voi.windowWidth &&
            image.lut.invert === viewport.invert &&
            invalidated !== true) {
            return image.lut;
        }

        // lut is invalid or not present, regenerate it and cache it
        cornerstone.generateLut(image, viewport.voi.windowWidth, viewport.voi.windowCenter, viewport.invert);
        image.lut.windowWidth = viewport.voi.windowWidth;
        image.lut.windowCenter = viewport.voi.windowCenter;
        image.lut.invert = viewport.invert;
        return image.lut;
    }

    function doesImageNeedToBeRendered(enabledElement, image)
    {
        if(image.imageId !== lastRenderedImageId ||
            lastRenderedViewport.windowCenter !== enabledElement.viewport.voi.windowCenter ||
            lastRenderedViewport.windowWidth !== enabledElement.viewport.voi.windowWidth ||
            lastRenderedViewport.invert !== enabledElement.viewport.invert ||
            lastRenderedViewport.rotation !== enabledElement.viewport.rotation ||
            lastRenderedViewport.hflip !== enabledElement.viewport.hflip ||
            lastRenderedViewport.vflip !== enabledElement.viewport.vflip
            )
        {
            return true;
        }

        return false;
    }

    function getRenderCanvas(enabledElement, image, invalidated)
    {
        // apply the lut to the stored pixel data onto the render canvas

        if(doesImageNeedToBeRendered(enabledElement, image) === false && invalidated !== true) {
            return grayscaleRenderCanvas;
        }

        // If our render canvas does not match the size of this image reset it
        // NOTE: This might be inefficient if we are updating multiple images of different
        // sizes frequently.
        if(grayscaleRenderCanvas.width !== image.width || grayscaleRenderCanvas.height != image.height) {
            initializeGrayscaleRenderCanvas(image);
        }

        // get the lut to use
        var lut = getLut(image, enabledElement.viewport, invalidated);
        // gray scale image - apply the lut and put the resulting image onto the render canvas
        cornerstone.storedPixelDataToCanvasImageData(image, lut, grayscaleRenderCanvasData.data);
        grayscaleRenderCanvasContext.putImageData(grayscaleRenderCanvasData, 0, 0);
        return grayscaleRenderCanvas;
    }

    /**
     * API function to draw a grayscale image to a given enabledElement
     * @param enabledElement
     * @param invalidated - true if pixel data has been invaldiated and cached rendering should not be used
     */
    function renderGrayscaleImage(enabledElement, invalidated) {

        if(enabledElement === undefined) {
            throw "drawImage: enabledElement parameter must not be undefined";
        }
        var image = enabledElement.image;
        if(image === undefined) {
            throw "drawImage: image must be loaded before it can be drawn";
        }

        // get the canvas context and reset the transform
        var context = enabledElement.canvas.getContext('2d');
        context.setTransform(1, 0, 0, 1, 0, 0);

        // clear the canvas
        context.fillStyle = 'black';
        context.fillRect(0,0, enabledElement.canvas.width, enabledElement.canvas.height);

        // turn off image smooth/interpolation if pixelReplication is set in the viewport
        if(enabledElement.viewport.pixelReplication === true) {
            context.imageSmoothingEnabled = false;
            context.mozImageSmoothingEnabled = false; // firefox doesn't support imageSmoothingEnabled yet
        }
        else {
            context.imageSmoothingEnabled = true;
            context.mozImageSmoothingEnabled = true;
        }

        // save the canvas context state and apply the viewport properties
        cornerstone.setToPixelCoordinateSystem(enabledElement, context);

        var renderCanvas = getRenderCanvas(enabledElement, image, invalidated);

        // Draw the render canvas half the image size (because we set origin to the middle of the canvas above)
        context.drawImage(renderCanvas, 0,0, image.width, image.height, 0, 0, image.width, image.height);

        lastRenderedImageId = image.imageId;
        lastRenderedViewport.windowCenter = enabledElement.viewport.voi.windowCenter;
        lastRenderedViewport.windowWidth = enabledElement.viewport.voi.windowWidth;
        lastRenderedViewport.invert = enabledElement.viewport.invert;
        lastRenderedViewport.rotation = enabledElement.viewport.rotation;
        lastRenderedViewport.hflip = enabledElement.viewport.hflip;
        lastRenderedViewport.vflip = enabledElement.viewport.vflip;
    }

    // Module exports
    cornerstone.rendering.grayscaleImage = renderGrayscaleImage;
    cornerstone.renderGrayscaleImage = renderGrayscaleImage;

}(cornerstone));

/**
 * This module is responsible for drawing a grayscale image
 */

(function (cornerstone) {

    "use strict";

    var grayscaleRenderCanvas = document.createElement('canvas');
    var grayscaleRenderCanvasContext;
    var grayscaleRenderCanvasData;

    var lastRenderedImageId;
    var lastRenderedViewport = {};

    function initWebGL(canvas) {
        // TODO for cornerstone : use failIfMajorPerformanceCaveat to determine if fallback is required.
        //      https://www.khronos.org/registry/webgl/specs/latest/1.0/#5.2.1
        var gl = null;
        try {
            // Try to grab the standard context. If it fails, fallback to experimental.
            gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        }
        catch(e) {}

        // If we don't have a GL context, give up now
        if (!gl) {
            alert("Unable to initialize WebGL. Your browser may not support it.");
            gl = null;
        }
        return gl;
    }

    function initShaders(gl) {
        // Create shader program
        var shaderProgram = gl.createProgram();

        // Create and attach the fragment Shader
        var fragShaderSrc = 'precision mediump float;' +
            'uniform sampler2D u_image;' +
            'uniform vec2 u_wl;' +
            'uniform vec2 u_slopeIntercept;' +
            'varying vec2 v_texCoord;' +
            'void main() {' +
                'vec4 packedTextureElement = texture2D(u_image, v_texCoord);' +
                // unpacking [ [uint8, uint8, ~, ~]] -> float and compute slope intercept
                'float grayLevel = (packedTextureElement[0]*255.0*256.0 + packedTextureElement[1]*255.0) * u_slopeIntercept[0] + u_slopeIntercept[1];' +
                // W/L transformation.
                'float grayLevel_wl = clamp( ( grayLevel - u_wl[0] ) / (u_wl[1] - u_wl[0]), 0.0, 1.0);' +
                // RGBA output'
                'gl_FragColor = vec4(grayLevel_wl, grayLevel_wl, grayLevel_wl, 1);' +
            '}';

        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragShaderSrc);
        gl.compileShader(fragmentShader);
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            throw "An error occurred compiling the fragment shader";
        }
        gl.attachShader(shaderProgram, fragmentShader);

        // Create and attach the vertex shader
        var vertexShaderSrc = 'attribute vec2 a_position;' +
            'attribute vec2 a_texCoord;' +
            'uniform vec2 u_resolution;' +
            'varying vec2 v_texCoord;' +
            'void main() {' +
                'vec2 zeroToOne = a_position / u_resolution;' +
                'vec2 zeroToTwo = zeroToOne * 2.0;' +
                'vec2 clipSpace = zeroToTwo - 1.0;' +
                'gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);' +
                'v_texCoord = a_texCoord;' +
            '}';

        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexShaderSrc);
        gl.compileShader(vertexShader);
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            throw "An error occurred compiling the vertex shader";
        }
        gl.attachShader(shaderProgram, vertexShader);

        gl.linkProgram(shaderProgram);

        // If creating the shader program failed, alert
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            throw "Unable to initialize the shader program.";
        }

        gl.useProgram(shaderProgram);
        return shaderProgram;
    }

    function render(gl) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    
    function setRectangle(gl, x, y, width, height) {
        var x1 = x;
        var x2 = x + width;
        var y1 = y;
        var y2 = y + height;
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
              x1, y1,
              x2, y1,
              x1, y2,
              x1, y2,
              x2, y1,
              x2, y2]), gl.STATIC_DRAW);
    }

    function initializeGrayscaleRenderCanvas(image) {
        // Resize the canvas
        grayscaleRenderCanvas.width = image.width;
        grayscaleRenderCanvas.height = image.height;
    }

    function getLut(image, viewport, invalidated) {
        // if we have a cached lut and it has the right values, return it immediately
        if (image.lut !== undefined &&
            image.lut.windowCenter === viewport.voi.windowCenter &&
            image.lut.windowWidth === viewport.voi.windowWidth &&
            image.lut.invert === viewport.invert &&
            invalidated !== true) {
            return image.lut;
        }

        // lut is invalid or not present, regenerate it and cache it
        cornerstone.generateLut(image, viewport.voi.windowWidth, viewport.voi.windowCenter, viewport.invert);
        image.lut.windowWidth = viewport.voi.windowWidth;
        image.lut.windowCenter = viewport.voi.windowCenter;
        image.lut.invert = viewport.invert;
        return image.lut;
    }

    function doesImageNeedToBeRendered(enabledElement, image)
    {
        if (image.imageId !== lastRenderedImageId ||
            lastRenderedViewport.windowCenter !== enabledElement.viewport.voi.windowCenter ||
            lastRenderedViewport.windowWidth !== enabledElement.viewport.voi.windowWidth ||
            lastRenderedViewport.invert !== enabledElement.viewport.invert ||
            lastRenderedViewport.rotation !== enabledElement.viewport.rotation ||
            lastRenderedViewport.hflip !== enabledElement.viewport.hflip ||
            lastRenderedViewport.vflip !== enabledElement.viewport.vflip
            ) {
            return true;
        }

        return false;
    }

    function getRenderCanvas(enabledElement, image, invalidated)
    {
        // apply the lut to the stored pixel data onto the render canvas
        if (doesImageNeedToBeRendered(enabledElement, image) === false && invalidated !== true) {
            return grayscaleRenderCanvas;
        }

        // If our render canvas does not match the size of this image reset it
        // NOTE: This might be inefficient if we are updating multiple images of different
        // sizes frequently.
        if (grayscaleRenderCanvas.width !== image.width || grayscaleRenderCanvas.height != image.height) {
            initializeGrayscaleRenderCanvas(image);
        }
        return grayscaleRenderCanvas;
    }

    /**
     * API function to draw a grayscale image to a given enabledElement
     * @param enabledElement
     * @param invalidated - true if pixel data has been invaldiated and cached rendering should not be used
     */
    function renderGrayscaleImageWebGL(enabledElement, invalidated) {
        if (!enabledElement) {
            throw "drawImage: enabledElement parameter must not be undefined";
        }

        var image = enabledElement.image;
        if (!image) {
            throw "drawImage: image must be loaded before it can be drawn";
        }

        // Start WebGL drawing
        var pixelData = image.getPixelData();

        // Get A WebGL context
        var canvas = enabledElement.canvas;
        var gl = initWebGL(canvas);
        var program = initShaders(gl);

        gl.clearColor(0.5, 0.0, 0.0, 1.0);

        // Transfer image data.
        // Some WebGL implementation supports floats components that could be used with medical images.
        // However, it rely a optional extension that is not supported by all hardware.
        // Furthermore, float textures have 4 channels (usually for RGBA) which means that each pixel requires
        // 16 bytes (4 floats32) of memory. To mitigate both issues, I have decided pack 16 bit in the 2 first
        // uint8 components (r and g). b and a are still available for other purposes.

        // In the demo, I just concatenate a 512x512 image 4 times in each direction to create a 2048x2048 image.
        var width = 512;
        var height = 512;
        var numberOfChannels = 4;
        var format = gl.RGBA;

        // GL texture configuration
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);


        // Create texture, pack uint16 into two uint8 (r and g) and concatenate.
        var data = new Uint8Array(width * height * numberOfChannels);
        // ii+=4 iterates over each pixels, not components.
        for (var ii = 0; ii < data.length; ii+=4) {
            // ugly modulo magic to translate ii to image coordinate and concatenate.
            var x = Math.floor(ii/4)%width;
            var y = Math.floor(Math.floor(ii/4)/height);
            var val = pixelData[(y%512)*512+(x%512)];
            
            // uint16 -> [uint8, uint8, ~, ~]
            // Only unsigned is implemented. Shader will also need to support other formats.
            data[ii+0] = (val & 0x0000FF00) >> 8;
            data[ii+1] = (val & 0x000000FF);
            data[ii+2] = 0;
            data[ii+3] = 0;
        }
        gl.texImage2D(gl.TEXTURE_2D, 0, format, width, height, 0, format, gl.UNSIGNED_BYTE, data);

        // look up where the vertex data needs to go.
        var positionLocation = gl.getAttribLocation(program, "a_position");
        var texCoordLocation = gl.getAttribLocation(program, "a_texCoord");

        // provide texture coordinates for the rectangle.
        var texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0.0,  0.0,
            1.0,  0.0,
            0.0,  1.0,
            0.0,  1.0,
            1.0,  0.0,
            1.0,  1.0]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(texCoordLocation);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);


        // set the resolution
        var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

        // set initial window/level (vec2)
        var wlLocation = gl.getUniformLocation(program, "u_wl");
        gl.uniform2f(wlLocation, -160, 240 );

        // set Slope Intercept (vec2)
        var siLocation = gl.getUniformLocation(program, "u_slopeIntercept");
        gl.uniform2f(siLocation, 1, -1000);

        // Create a buffer for the position of the rectangle corners.
        var posbuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posbuffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        setRectangle(gl, 0, 0, width, height);

        //var ii=0;
        // redraw with changing W/L
        // docs says requestAnimationFrame is better..
        function step(timestamp) {
            ii += 10;

            var t0 = performance.now();
            gl.uniform2f(wlLocation, -ii%1000-50, ii%1000+50 );
            render(gl,texture, program);
            var t1 = performance.now();
            window.requestAnimationFrame(step);
        }
        //window.requestAnimationFrame(step)
        render(gl,texture, program);

        // Save lastRendered information
        lastRenderedImageId = image.imageId;
        lastRenderedViewport.windowCenter = enabledElement.viewport.voi.windowCenter;
        lastRenderedViewport.windowWidth = enabledElement.viewport.voi.windowWidth;
        lastRenderedViewport.invert = enabledElement.viewport.invert;
        lastRenderedViewport.rotation = enabledElement.viewport.rotation;
        lastRenderedViewport.hflip = enabledElement.viewport.hflip;
        lastRenderedViewport.vflip = enabledElement.viewport.vflip;
    }

    // Module exports
    cornerstone.rendering.grayscaleImageWebGL = renderGrayscaleImageWebGL;
    cornerstone.renderGrayscaleImageWebGL = renderGrayscaleImageWebGL;

}(cornerstone));

/**
 * This module is responsible for drawing an image to an enabled elements canvas element
 */

(function (cornerstone) {

    "use strict";

    /**
     * API function to draw a standard web image (PNG, JPG) to an enabledImage
     *
     * @param enabledElement
     * @param invalidated - true if pixel data has been invaldiated and cached rendering should not be used
     */
    function renderWebImage(enabledElement, invalidated) {

        if(enabledElement === undefined) {
            throw "drawImage: enabledElement parameter must not be undefined";
        }
        var image = enabledElement.image;
        if(image === undefined) {
            throw "drawImage: image must be loaded before it can be drawn";
        }

        // get the canvas context and reset the transform
        var context = enabledElement.canvas.getContext('2d');
        context.setTransform(1, 0, 0, 1, 0, 0);

        // clear the canvas
        context.fillStyle = 'black';
        context.fillRect(0,0, enabledElement.canvas.width, enabledElement.canvas.height);

        // turn off image smooth/interpolation if pixelReplication is set in the viewport
        if(enabledElement.viewport.pixelReplication === true) {
            context.imageSmoothingEnabled = false;
            context.mozImageSmoothingEnabled = false; // firefox doesn't support imageSmoothingEnabled yet
        }
        else {
            context.imageSmoothingEnabled = true;
            context.mozImageSmoothingEnabled = true;
        }

        // save the canvas context state and apply the viewport properties
        cornerstone.setToPixelCoordinateSystem(enabledElement, context);

        // if the viewport ww/wc and invert all match the initial state of the image, we can draw the image
        // directly.  If any of those are changed, we call renderColorImage() to apply the lut
        if(enabledElement.viewport.voi.windowWidth === enabledElement.image.windowWidth &&
            enabledElement.viewport.voi.windowCenter === enabledElement.image.windowCenter &&
            enabledElement.viewport.invert === false)
        {
            context.drawImage(image.getImage(), 0, 0, image.width, image.height, 0, 0, image.width, image.height);
        } else {
            cornerstone.renderColorImage(enabledElement, invalidated);
        }

    }

    // Module exports
    cornerstone.rendering.webImage = renderWebImage;
    cornerstone.renderWebImage = renderWebImage;

}(cornerstone));
/**
 * This module is responsible for enabling an element to display images with cornerstone
 */
(function (cornerstone) {

    "use strict";

    function setCanvasSize(element, canvas)
    {
        // the device pixel ratio is 1.0 for normal displays and > 1.0
        // for high DPI displays like Retina
        /*

        This functionality is disabled due to buggy behavior on systems with mixed DPI's.  If the canvas
        is created on a display with high DPI (e.g. 2.0) and then the browser window is dragged to
        a different display with a different DPI (e.g. 1.0), the canvas is not recreated so the pageToPixel
        produces incorrect results.  I couldn't find any way to determine when the DPI changed other than
        by polling which is not very clean.  If anyone has any ideas here, please let me know, but for now
        we will disable this functionality.  We may want
        to add a mechanism to optionally enable this functionality if we can determine it is safe to do
        so (e.g. iPad or iPhone or perhaps enumerate the displays on the system.  I am choosing
        to be cautious here since I would rather not have bug reports or safety issues related to this
        scenario.

        var devicePixelRatio = window.devicePixelRatio;
        if(devicePixelRatio === undefined) {
            devicePixelRatio = 1.0;
        }
        */

        canvas.width = element.clientWidth;
        canvas.height = element.clientHeight;
        canvas.style.width = element.clientWidth + "px";
        canvas.style.height = element.clientHeight + "px";
    }

    /**
     * resizes an enabled element and optionally fits the image to window
     * @param element
     * @param fitToWindow true to refit, false to leave viewport parameters as they are
     */
    function resize(element, fitToWindow) {

        var enabledElement = cornerstone.getEnabledElement(element);

        setCanvasSize(element, enabledElement.canvas);

        if(enabledElement.image === undefined ) {
            return;
        }

        if(fitToWindow === true) {
            cornerstone.fitToWindow(element);
        }
        else {
            cornerstone.updateImage(element);
        }
    }

    // module/private exports
    cornerstone.resize = resize;

}(cornerstone));
/**
 * This module contains a function that will set the canvas context to the pixel coordinates system
 * making it easy to draw geometry on the image
 */

(function (cornerstone) {

    "use strict";

    /**
     * Sets the canvas context transformation matrix to the pixel coordinate system.  This allows
     * geometry to be driven using the canvas context using coordinates in the pixel coordinate system
     * @param ee
     * @param context
     * @param scale optional scaler to apply
     */
    function setToPixelCoordinateSystem(enabledElement, context, scale)
    {
        if(enabledElement === undefined) {
            throw "setToPixelCoordinateSystem: parameter enabledElement must not be undefined";
        }
        if(context === undefined) {
            throw "setToPixelCoordinateSystem: parameter context must not be undefined";
        }

        var transform = cornerstone.internal.calculateTransform(enabledElement, scale);
        context.setTransform(transform.m[0],transform.m[1],transform.m[2],transform.m[3],transform.m[4],transform.m[5],transform.m[6]);
    }

    // Module exports
    cornerstone.setToPixelCoordinateSystem = setToPixelCoordinateSystem;
}(cornerstone));
/**
 * This module contains functions to deal with getting and setting the viewport for an enabled element
 */
(function (cornerstone) {

    "use strict";

    function setViewport(element, viewport) {

        var enabledElement = cornerstone.getEnabledElement(element);

        enabledElement.viewport.scale = viewport.scale;
        enabledElement.viewport.translation.x = viewport.translation.x;
        enabledElement.viewport.translation.y = viewport.translation.y;
        enabledElement.viewport.voi.windowWidth = viewport.voi.windowWidth;
        enabledElement.viewport.voi.windowCenter = viewport.voi.windowCenter;
        enabledElement.viewport.invert = viewport.invert;
        enabledElement.viewport.pixelReplication = viewport.pixelReplication;
        enabledElement.viewport.rotation = viewport.rotation;
        enabledElement.viewport.hflip = viewport.hflip;
        enabledElement.viewport.vflip = viewport.vflip;

        // prevent window width from being < 1
        if(enabledElement.viewport.voi.windowWidth < 1) {
            enabledElement.viewport.voi.windowWidth = 1;
        }
        // prevent scale from getting too small
        if(enabledElement.viewport.scale < 0.0001) {
            enabledElement.viewport.scale = 0.25;
        }

        if(enabledElement.viewport.rotation===360 || enabledElement.viewport.rotation===-360) {
            enabledElement.viewport.rotation = 0;
        }

        // Force the image to be updated since the viewport has been modified
        cornerstone.updateImage(element);
    }


    // module/private exports
    cornerstone.setViewport = setViewport;

}(cornerstone));

/**
 * This module contains a function to immediately redraw an image
 */
(function (cornerstone) {

    "use strict";

    /**
     * Forces the image to be updated/redrawn for the specified enabled element
     * @param element
     */
    function updateImage(element, invalidated) {
        var enabledElement = cornerstone.getEnabledElement(element);

        if(enabledElement.image === undefined) {
            throw "updateImage: image has not been loaded yet";
        }

        cornerstone.drawImage(enabledElement, invalidated);
    }

    // module exports
    cornerstone.updateImage = updateImage;

}(cornerstone));