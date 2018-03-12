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

export function getCacheInfo () {
  return {
    maximumSizeInBytes,
    cacheSizeInBytes,
    numberOfImagesCached: cachedImages.length
  };
}

// This method should only be called by `removeImageLoadObject` because it's
// The one that knows how to deal with shared cache keys and cache size.
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

export function purgeCache () {
  while (cachedImages.length > 0) {
    const removedCachedImage = cachedImages[0];

    removeImageLoadObject(removedCachedImage.imageId);
  }
}

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
