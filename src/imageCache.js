import EVENTS, { events } from './events.js';
import triggerEvent from './triggerEvent.js';

/**
 * This module deals with caching images
 * @module ImageCache
 */

let maximumSizeInBytes = 1024 * 1024 * 1024; // 1 GB
let cacheSizeInBytes = 0;

// Dictionary of imageId to cachedImage objects
const imageCacheDict = {};

// Array of cachedImage objects
export const cachedImages = [];

/** Sets the maximum size of cache and purges cache contents if necessary.
 *
 * @param {number} numBytes The maximun size that the cache should occupy.
 * @returns {void}
 */
export function setMaximumSizeBytes (numBytes) {
  if (numBytes === undefined) {
    throw new Error('setMaximumSizeBytes: parameter numBytes must not be undefined');
  }
  if (numBytes.toFixed === undefined) {
    throw new Error('setMaximumSizeBytes: parameter numBytes must be a number');
  }

  maximumSizeInBytes = numBytes;

  triggerEvent(events, EVENTS.IMAGE_CACHE_MAXIMUM_SIZE_CHANGED);

  purgeCacheIfNecessary();
}

/**
 * Purges the cache if size exceeds maximum
 * @returns {void}
 */
function purgeCacheIfNecessary () {
  // If max cache size has not been exceeded, do nothing
  if (cacheSizeInBytes <= maximumSizeInBytes) {
    return;
  }

  // Cache size has been exceeded, create list of images sorted by timeStamp
  // So we can purge the least recently used image
  function compare (a, b) {
    if (a.timeStamp > b.timeStamp) {
      return -1;
    }
    if (a.timeStamp < b.timeStamp) {
      return 1;
    }

    return 0;
  }
  cachedImages.sort(compare);

  // Remove images as necessary)
  while (cacheSizeInBytes > maximumSizeInBytes) {
    const lastCachedImage = cachedImages[cachedImages.length - 1];
    const imageId = lastCachedImage.imageId;

    removeImageLoadObject(imageId);

    triggerEvent(events, EVENTS.IMAGE_CACHE_PROMISE_REMOVED, { imageId });
  }

  const cacheInfo = getCacheInfo();

  triggerEvent(events, EVENTS.IMAGE_CACHE_FULL, cacheInfo);
}

/**
 * Puts a new image loader into the cache
 *
 * @param {string} imageId ImageId of the image loader
 * @param {Object} imageLoadObject The object that is loading or loaded the image
 * @returns {void}
 */
export function putImageLoadObject (imageId, imageLoadObject) {
  if (imageId === undefined) {
    throw new Error('putImageLoadObject: imageId must not be undefined');
  }
  if (imageLoadObject.promise === undefined) {
    throw new Error('putImageLoadObject: imageLoadObject.promise must not be undefined');
  }
  if (imageCacheDict.hasOwnProperty(imageId) === true) {
    throw new Error('putImageLoadObject: imageId already in cache');
  }
  if (imageLoadObject.cancelFn && typeof imageLoadObject.cancelFn !== 'function') {
    throw new Error('putImageLoadObject: imageLoadObject.cancelFn must be a function');
  }

  const cachedImage = {
    loaded: false,
    imageId,
    sharedCacheKey: undefined, // The sharedCacheKey for this imageId.  undefined by default
    imageLoadObject,
    timeStamp: Date.now(),
    sizeInBytes: 0
  };

  imageCacheDict[imageId] = cachedImage;
  cachedImages.push(cachedImage);

  imageLoadObject.promise.then(function (image) {
    if (cachedImages.indexOf(cachedImage) === -1) {
      // If the image has been purged before being loaded, we stop here.
      return;
    }

    cachedImage.loaded = true;
    cachedImage.image = image;

    if (image.sizeInBytes === undefined) {
      throw new Error('putImageLoadObject: image.sizeInBytes must not be undefined');
    }
    if (image.sizeInBytes.toFixed === undefined) {
      throw new Error('putImageLoadObject: image.sizeInBytes is not a number');
    }

    cachedImage.sizeInBytes = image.sizeInBytes;
    cacheSizeInBytes += cachedImage.sizeInBytes;

    const eventDetails = {
      action: 'addImage',
      image: cachedImage
    };

    triggerEvent(events, EVENTS.IMAGE_CACHE_CHANGED, eventDetails);

    cachedImage.sharedCacheKey = image.sharedCacheKey;

    purgeCacheIfNecessary();
  }, () => {
    const cachedImage = imageCacheDict[imageId];

    cachedImages.splice(cachedImages.indexOf(cachedImage), 1);
    delete imageCacheDict[imageId];
  });
}

/**
 * Retuns the object that is loading a given imageId
 *
 * @param {string} imageId Image ID
 * @returns {void}
 */
export function getImageLoadObject (imageId) {
  if (imageId === undefined) {
    throw new Error('getImageLoadObject: imageId must not be undefined');
  }
  const cachedImage = imageCacheDict[imageId];

  if (cachedImage === undefined) {
    return;
  }

  // Bump time stamp for cached image
  cachedImage.timeStamp = Date.now();

  return cachedImage.imageLoadObject;
}

/**
 * Removes the image loader associated with a given Id from the cache
 *
 * @param {string} imageId Image ID
 * @returns {void}
 */
export function removeImageLoadObject (imageId) {
  if (imageId === undefined) {
    throw new Error('removeImageLoadObject: imageId must not be undefined');
  }
  const cachedImage = imageCacheDict[imageId];

  if (cachedImage === undefined) {
    throw new Error('removeImageLoadObject: imageId was not present in imageCache');
  }

  cachedImages.splice(cachedImages.indexOf(cachedImage), 1);
  cacheSizeInBytes -= cachedImage.sizeInBytes;

  const eventDetails = {
    action: 'deleteImage',
    image: cachedImage
  };

  triggerEvent(events, EVENTS.IMAGE_CACHE_CHANGED, eventDetails);
  decache(cachedImage.imageLoadObject);

  delete imageCacheDict[imageId];
}

/**
 * @typedef {Object} CacheInformation
 * @property {number} maximumSizeInBytes  The maximum size of the cache in bytes
 * @property {number} cacheSizeInBytes Currently occupied space in the cache in bytes
 * @property {number} numberOfImagesCached Number of ImageLoaders in the cache
 * @returns {void}
 */

/**
 * Gets the current state of the cache
 * @returns {void}
 */
export function getCacheInfo () {
  return {
    maximumSizeInBytes,
    cacheSizeInBytes,
    numberOfImagesCached: cachedImages.length
  };
}

// This method should only be called by `removeImageLoadObject` because it's
// The one that knows how to deal with shared cache keys and cache size.
/**
 * INTERNAL: Removes and ImageLoader from the cache
 *
 * @param {Object} imageLoadObject Image Loader Object to remove
 * @returns {void}
 */
function decache (imageLoadObject) {
  imageLoadObject.promise.then(
    function () {
      if (imageLoadObject.decache) {
        imageLoadObject.decache();
      }
    },
    function () {
      if (imageLoadObject.decache) {
        imageLoadObject.decache();
      }
    }
  );
}

/**
 * Removes all images from cache
 * @returns {void}
 */
export function purgeCache () {
  while (cachedImages.length > 0) {
    const removedCachedImage = cachedImages[0];

    removeImageLoadObject(removedCachedImage.imageId);
  }
}

/**
 * Updates the space than an image is using in the cache
 *
 * @param {string} imageId Image ID
 * @param {number} newCacheSize New image size
 * @returns {void}
 */
export function changeImageIdCacheSize (imageId, newCacheSize) {
  const cacheEntry = imageCacheDict[imageId];

  if (cacheEntry) {
    cacheEntry.imageLoadObject.promise.then(function (image) {
      const cacheSizeDifference = newCacheSize - image.sizeInBytes;

      image.sizeInBytes = newCacheSize;
      cacheEntry.sizeInBytes = newCacheSize;
      cacheSizeInBytes += cacheSizeDifference;

      const eventDetails = {
        action: 'changeImageSize',
        image
      };

      triggerEvent(events, EVENTS.IMAGE_CACHE_CHANGED, eventDetails);
    });
  }
}

export default {
  imageCache: imageCacheDict,
  cachedImages,
  setMaximumSizeBytes,
  putImageLoadObject,
  getImageLoadObject,
  removeImageLoadObject,
  getCacheInfo,
  purgeCache,
  changeImageIdCacheSize
};
