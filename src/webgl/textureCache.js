/**
 * This module deals with caching image textures in VRAM for WebGL
 */

(function (cornerstone) {

    "use strict";

    var imageCache = {};

    var cachedImages = [];

    var maximumSizeInBytes = 1024 * 1024 * 256; // 256 MB
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
            cachedImages.pop();
            $(cornerstone).trigger('CornerstoneWebGLTextureRemoved', {imageId: lastCachedImage.imageId});
        }

        var cacheInfo = cornerstone.imageCache.getCacheInfo();
        console.log('CornerstoneWebGLTextureCacheFull');
        $(cornerstone).trigger('CornerstoneWebGLTextureCacheFull', cacheInfo);
    }

    function putImageTexture(image, imageTexture) {
        var imageId = image.imageId;
        if (image === undefined) {
            throw "putImageTexture: image must not be undefined";
        }

        if (imageId === undefined) {
            throw "putImageTexture: imageId must not be undefined";
        }

        if (imageTexture === undefined) {
            throw "putImageTexture: imageTexture must not be undefined";
        }

        if (imageCache.hasOwnProperty(imageId) === true) {
            throw "putImageTexture: imageId already in cache";
        }

        var cachedImage = {
            imageId : imageId,
            imageTexture : imageTexture,
            timeStamp : new Date(),
            sizeInBytes: imageTexture.sizeInBytes
        };

        imageCache[imageId] = cachedImage;
        cachedImages.push(cachedImage);

        if (imageTexture.sizeInBytes === undefined) {
            throw "putImageTexture: imageTexture does not have sizeInBytes property or";
        }
        if (imageTexture.sizeInBytes.toFixed === undefined) {
            throw "putImageTexture: imageTexture.sizeInBytes is not a number";
        }
        cacheSizeInBytes += cachedImage.sizeInBytes;
        purgeCacheIfNecessary();
    }

    function getImageTexture(imageId) {
        if (imageId === undefined) {
            throw "getImageTexture: imageId must not be undefined";
        }
        var cachedImage = imageCache[imageId];
        if (cachedImage === undefined) {
            return undefined;
        }

        // bump time stamp for cached image
        cachedImage.timeStamp = new Date();
        return cachedImage.imageTexture;
    }

    function removeImageTexture(imageId) {
        if (imageId === undefined) {
            throw "removeImageTexture: imageId must not be undefined";
        }
        var cachedImage = imageCache[imageId];
        if (cachedImage === undefined) {
            throw "removeImageTexture: imageId must not be undefined";
        }
        cachedImages.splice( cachedImages.indexOf(cachedImage), 1);
        cacheSizeInBytes -= cachedImage.sizeInBytes;
        delete imageCache[imageId];

        return cachedImage.imageTexture;
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
        }
        cacheSizeInBytes = 0;
    }

    // module exports
    cornerstone.webGL.textureCache = {
        putImageTexture : putImageTexture,
        getImageTexture: getImageTexture,
        removeImageTexture: removeImageTexture,
        setMaximumSizeBytes: setMaximumSizeBytes,
        getCacheInfo : getCacheInfo,
        purgeCache: purgeCache,
        cachedImages: cachedImages
    };

}(cornerstone));
