/**
 * This module deals with ImageLoaders, loading images and caching images
 */
import { getImagePromise, putImagePromise } from './imageCache.js';
import events from './events.js';

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
  let imagePromise;

  if (loader === undefined || loader === null) {
    if (unknownImageLoader !== undefined) {
      imagePromise = unknownImageLoader(imageId);

      return imagePromise;
    }

    throw new Error('loadImageFromImageLoader: no image loader for imageId');
  }

  imagePromise = loader(imageId, options);

  // Broadcast an image loaded event once the image is loaded
  imagePromise.then(function (image) {
    $(events).trigger('CornerstoneImageLoaded', { image });
  });

  return imagePromise;
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

  let imagePromise = getImagePromise(imageId);

  if (imagePromise !== undefined) {
    return imagePromise;
  }

  imagePromise = loadImageFromImageLoader(imageId, options);

  return imagePromise;
}

//

/**
 * Loads an image given an imageId and optional priority and returns a promise which will resolve to
 * the loaded image object or fail if an error occurred. The image is stored in the cache.
 *
 * @param {String} imageId A Cornerstone Image Object's imageId
 * @param {Object} [options] Options to be passed to the Image Loader
 *
 * @returns {Deferred} A jQuery Deferred which can be used to act after an image is loaded or loading fails
 */
export function loadAndCacheImage (imageId, options) {
  if (imageId === undefined) {
    throw new Error('loadAndCacheImage: parameter imageId must not be undefined');
  }

  let imagePromise = getImagePromise(imageId);

  if (imagePromise !== undefined) {
    return imagePromise;
  }

  imagePromise = loadImageFromImageLoader(imageId, options);

  putImagePromise(imageId, imagePromise);

  return imagePromise;
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
