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

    function removeImageId(imageId) {
        if(imageId === undefined) {
            throw "removeImagePromise: imageId must not be undefined";
        }
        var cachedImage = imageCache[imageId];
        if(cachedImage === undefined) {
            return false;
        }
        cachedImages.splice( cachedImages.indexOf(cachedImage), 1);
        cacheSizeInBytes -= cachedImage.sizeInBytes;
        delete imageCache[imageId];

        return true;
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
        removeImageId: removeImageId,
        setMaximumSizeBytes: setMaximumSizeBytes,
        getCacheInfo : getCacheInfo,
        purgeCache: purgeCache
    };

    return cornerstone;
}(cornerstone));
