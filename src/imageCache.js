/**
 * This module deals with caching images
 */

var cornerstone = (function (cornerstone) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
    }

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
        // if max cache size has not been exceded, do nothing
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

    function getCacheInfo() {
        return {
            maximumSizeInBytes : maximumSizeInBytes,
            cacheSizeInBytes : cacheSizeInBytes,
            numberOfImagesCached: cachedImages.length
        };
    }

    function purgeCache() {
        var oldMaximumSizeInBytes = maximumSizeInBytes;
        maximumSizeInBytes = 0;
        purgeCacheIfNecessary();
        maximumSizeInBytes = oldMaximumSizeInBytes;
    }

    // module exports

    cornerstone.imageCache = {
        putImagePromise : putImagePromise,
        getImagePromise: getImagePromise,
        setMaximumSizeBytes: setMaximumSizeBytes,
        getCacheInfo : getCacheInfo,
        purgeCache: purgeCache
    };

    return cornerstone;
}(cornerstone));