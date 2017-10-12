import { getImageLoadObject, putImageLoadObject } from './imageCache.js';
import events from './events.js';
import triggerEvent from './triggerEvent.js';

/**
 * This module deals with ImageLoaders, loading images and caching images
 */


const imageLoaders = {};

let unknownImageLoader;

/**
 * Load an image using a registered Cornerstone Image Loader.
 *
 * The image loader that is used will be
 * determined by the image loader scheme matching against the imageId.
 *
 * @param {String} imageId A Cornerstone Image Object's imageId
 * @param {Object} [options] Options to be passed to the Image Loader
 *
 * @returns {Deferred} A jQuery Deferred which can be used to act after an image is loaded or loading fails
 */
function loadImageFromImageLoader (imageId, options) {
  const colonIndex = imageId.indexOf(':');
  const scheme = imageId.substring(0, colonIndex);
  const loader = imageLoaders[scheme];

  if (loader === undefined || loader === null) {
    if (unknownImageLoader !== undefined) {
      return unknownImageLoader(imageId);
    }

    throw new Error('loadImageFromImageLoader: no image loader for imageId');
  }

  const imageLoadObject = loader(imageId, options);

  // Broadcast an image loaded event once the image is loaded
  imageLoadObject.promise.then(function (image) {
    triggerEvent(events, 'CornerstoneImageLoaded', { image });
  }, function (error) {
    const errorObject = {
      imageId,
      error
    };

    triggerEvent(events, 'CornerstoneImageLoadFailed', errorObject);
  });

  return imageLoadObject;
}

/**
 * Loads an image given an imageId and optional priority and returns a promise which will resolve to
 * the loaded image object or fail if an error occurred.  The loaded image is not stored in the cache.
 *
 * @param {String} imageId A Cornerstone Image Object's imageId
 * @param {Object} [options] Options to be passed to the Image Loader
 *
 * @returns {Deferred} A jQuery Deferred which can be used to act after an image is loaded or loading fails
 */
export function loadImage (imageId, options) {
  if (imageId === undefined) {
    throw new Error('loadImage: parameter imageId must not be undefined');
  }

  const imageLoadObject = getImageLoadObject(imageId);

  if (imageLoadObject !== undefined) {
    return imageLoadObject.promise;
  }

  return loadImageFromImageLoader(imageId, options).promise;
}

//

/**
 * Loads an image given an imageId and optional priority and returns a promise which will resolve to
 * the loaded image object or fail if an error occurred. The image is stored in the cache.
 *
 * @param {String} imageId A Cornerstone Image Object's imageId
 * @param {Object} [options] Options to be passed to the Image Loader
 *
 * @returns {Object} Image Loader Object (TODO: define a JSDoc type for this)
 */
export function loadAndCacheImage (imageId, options) {
  if (imageId === undefined) {
    throw new Error('loadAndCacheImage: parameter imageId must not be undefined');
  }

  let imageLoadObject = getImageLoadObject(imageId);

  if (imageLoadObject !== undefined) {
    return imageLoadObject.promise;
  }

  imageLoadObject = loadImageFromImageLoader(imageId, options);

  putImageLoadObject(imageId, imageLoadObject);

  return imageLoadObject.promise;
}

/**
 * Registers an imageLoader plugin with cornerstone for the specified scheme
 *
 * @param {String} scheme The scheme to use for this image loader (e.g. 'dicomweb', 'wadouri', 'http')
 * @param {Function} imageLoader A Cornerstone Image Loader function
 * @returns {void}
 */
export function registerImageLoader (scheme, imageLoader) {
  imageLoaders[scheme] = imageLoader;
}

/**
 * Registers a new unknownImageLoader and returns the previous one
 *
 * @param {Function} imageLoader A Cornerstone Image Loader
 *
 * @returns {Function|Undefined} The previous Unknown Image Loader
 */
export function registerUnknownImageLoader (imageLoader) {
  const oldImageLoader = unknownImageLoader;

  unknownImageLoader = imageLoader;

  return oldImageLoader;
}
