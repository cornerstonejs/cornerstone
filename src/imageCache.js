/**
 * This module deals with caching images
 */

(function (cornerstone) {

    "use strict";

    // dictionary of imageId to cachedImage objects
    var imageCache = {};
    // dictionary of sharedCacheKeys to number of imageId's in cache with this shared cache key
    var sharedCacheKeys = {};
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
            cacheSizeInBytes -= lastCachedImage.sizeInBytes;
            delete imageCache[lastCachedImage.imageId];
            lastCachedImage.imagePromise.reject();
            cachedImages.pop();
            $(cornerstone).trigger('CornerstoneImageCachePromiseRemoved', {imageId: lastCachedImage.imageId});
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

            if (image.sizeInBytes === undefined) {
                throw "putImagePromise: image does not have sizeInBytes property or";
            }
            if (image.sizeInBytes.toFixed === undefined) {
                throw "putImagePromise: image.sizeInBytes is not a number";
            }

            // If this image has a shared cache key, reference count it and only
            // count the image size for the first one added with this sharedCacheKey
            if(image.sharedCacheKey) {
              cachedImage.sizeInBytes = image.sizeInBytes;
              cachedImage.sharedCacheKey = image.sharedCacheKey;
              if(sharedCacheKeys[image.sharedCacheKey]) {
                sharedCacheKeys[image.sharedCacheKey]++;
              } else {
                sharedCacheKeys[image.sharedCacheKey] = 1;
                cacheSizeInBytes += cachedImage.sizeInBytes;
              }
            }
            else {
              cachedImage.sizeInBytes = image.sizeInBytes;
              cacheSizeInBytes += cachedImage.sizeInBytes;
            }
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
        cachedImages.splice( cachedImages.indexOf(cachedImage), 1);

        // If this is using a sharedCacheKey, decrement the cache size only
        // if it is the last imageId in the cache with this sharedCacheKey
        if(cachedImages.sharedCacheKey) {
          if(sharedCacheKeys[cachedImages.sharedCacheKey] === 1) {
            cacheSizeInBytes -= cachedImage.sizeInBytes;
            delete sharedCacheKeys[cachedImages.sharedCacheKey];
          } else {
            sharedCacheKeys[cachedImages.sharedCacheKey]--;
          }
        } else {
          cacheSizeInBytes -= cachedImage.sizeInBytes;
        }
        delete imageCache[imageId];

        decache(cachedImage.imagePromise, cachedImage.imageId);

        return cachedImage.imagePromise;
    }

    function getCacheInfo() {
        return {
            maximumSizeInBytes : maximumSizeInBytes,
            cacheSizeInBytes : cacheSizeInBytes,
            numberOfImagesCached: cachedImages.length
        };
    }

    function decache(imagePromise, imageId) {
      imagePromise.then(function(image) {
        if(image.decache) {
          image.decache();
        }
        imagePromise.reject();
        delete imageCache[imageId];
      }).always(function() {
        delete imageCache[imageId];
      });
    }

    function purgeCache() {
        while (cachedImages.length > 0) {
          var removedCachedImage = cachedImages.pop();
          decache(removedCachedImage.imagePromise, removedCachedImage.imageId);
        }
        cacheSizeInBytes = 0;
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
        changeImageIdCacheSize: changeImageIdCacheSize
    };

}(cornerstone));
