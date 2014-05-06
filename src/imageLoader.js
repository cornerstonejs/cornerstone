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

    return cornerstone;
}(cornerstone));