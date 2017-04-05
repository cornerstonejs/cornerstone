/**
 * This module deals with caching images
 */

(function (cornerstone) {

    "use strict";

    // dictionary of imageId to cachedImage objects
    var imageCache = {};
    // array of cachedImage objects
    var cachedImages = [];

    var maximumSizeInBytes = 1024 * 1024 * 1024; // 1 GB
    var cacheSizeInBytes = 0;

    function setMaximumSizeBytes(numBytes) {
        if (numBytes === undefined) {
            throw "setMaximumSizeBytes: parameter numBytes must not be undefined";
        }
        if (numBytes.toFixed === undefined) {
            throw "setMaximumSizeBytes: parameter numBytes must be a number";
        }

        maximumSizeInBytes = numBytes;
        purgeCacheIfNecessary();
    }

    function purgeCacheIfNecessary() {
        // if max cache size has not been exceeded, do nothing
        if (cacheSizeInBytes <= maximumSizeInBytes) {
            return;
        }

        // cache size has been exceeded, create list of images sorted by timeStamp
        // so we can purge the least recently used image
        function compare(a,b) {
            if (a.timeStamp > b.timeStamp) {
                return -1;
            }
            if (a.timeStamp < b.timeStamp) {
                return 1;
            }
            return 0;
        }
        cachedImages.sort(compare);

        // remove images as necessary
        while(cacheSizeInBytes > maximumSizeInBytes) {
            var lastCachedImage = cachedImages[cachedImages.length - 1];
            var imageId = lastCachedImage.imageId;

            removeImagePromise(imageId);

            $(cornerstone).trigger('CornerstoneImageCachePromiseRemoved', {imageId: imageId});
        }

        var cacheInfo = cornerstone.imageCache.getCacheInfo();
        $(cornerstone).trigger('CornerstoneImageCacheFull', cacheInfo);
    }

    function putImagePromise(imageId, imagePromise) {
        if (imageId === undefined) {
            throw "getImagePromise: imageId must not be undefined";
        }
        if (imagePromise === undefined) {
            throw "getImagePromise: imagePromise must not be undefined";
        }

        if (imageCache.hasOwnProperty(imageId) === true) {
            throw "putImagePromise: imageId already in cache";
        }

        var cachedImage = {
            loaded : false,
            imageId : imageId,
            sharedCacheKey: undefined, // the sharedCacheKey for this imageId.  undefined by default
            imagePromise : imagePromise,
            timeStamp : new Date(),
            sizeInBytes: 0
        };

        imageCache[imageId] = cachedImage;
        cachedImages.push(cachedImage);

        imagePromise.then(function(image) {
            cachedImage.loaded = true;
            cachedImage.image = image;

            if (image.sizeInBytes === undefined) {
                throw "putImagePromise: image does not have sizeInBytes property or";
            }
            if (image.sizeInBytes.toFixed === undefined) {
                throw "putImagePromise: image.sizeInBytes is not a number";
            }

            cachedImage.sizeInBytes = image.sizeInBytes;
            cacheSizeInBytes += cachedImage.sizeInBytes;
            cachedImage.sharedCacheKey = image.sharedCacheKey;

            purgeCacheIfNecessary();
        });
    }

    function getImagePromise(imageId) {
        if (imageId === undefined) {
            throw "getImagePromise: imageId must not be undefined";
        }
        var cachedImage = imageCache[imageId];
        if (cachedImage === undefined) {
            return undefined;
        }

        // bump time stamp for cached image
        cachedImage.timeStamp = new Date();
        return cachedImage.imagePromise;
    }

    function removeImagePromise(imageId) {
        if (imageId === undefined) {
            throw "removeImagePromise: imageId must not be undefined";
        }
        var cachedImage = imageCache[imageId];
        if (cachedImage === undefined) {
            throw "removeImagePromise: imageId must not be undefined";
        }

        cachedImage.imagePromise.reject();
        cachedImages.splice( cachedImages.indexOf(cachedImage), 1);
        cacheSizeInBytes -= cachedImage.sizeInBytes;
        decache(cachedImage.imagePromise, cachedImage.imageId);

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

    // This method should only be called by `removeImagePromise` because it's
    // the one that knows how to deal with shared cache keys and cache size.
    function decache(imagePromise, imageId) {
        imagePromise.then(function(image) {
            if(image.decache) {
                image.decache();
            }
        }).always(function() {
            delete imageCache[imageId];
        });
    }

    function purgeCache() {
        while (cachedImages.length > 0) {
            var removedCachedImage = cachedImages[0];
            removeImagePromise(removedCachedImage.imageId);
        }
    }

    function changeImageIdCacheSize(imageId, newCacheSize) {
      var cacheEntry = imageCache[imageId];
      if(cacheEntry) {
        cacheEntry.imagePromise.then(function(image) {
          var cacheSizeDifference = newCacheSize - image.sizeInBytes;
          image.sizeInBytes = newCacheSize;
          cacheSizeInBytes += cacheSizeDifference;
        });
      }
    }

    // module exports
    cornerstone.imageCache = {
        putImagePromise : putImagePromise,
        getImagePromise: getImagePromise,
        removeImagePromise: removeImagePromise,
        setMaximumSizeBytes: setMaximumSizeBytes,
        getCacheInfo : getCacheInfo,
        purgeCache: purgeCache,
        cachedImages: cachedImages,
        imageCache: imageCache,
        changeImageIdCacheSize: changeImageIdCacheSize
    };

}(cornerstone));
