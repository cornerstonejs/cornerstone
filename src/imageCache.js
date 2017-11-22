import events from './events.js';
import triggerEvent from './triggerEvent.js';

/**
 * This module deals with caching images
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

  triggerEvent(events, 'CornerstoneImageCacheMaximumSizeChanged');

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

    removeImagePromise(imageId);

    triggerEvent(events, 'CornerstoneImageCachePromiseRemoved', { imageId });
  }

  const cacheInfo = getCacheInfo();

  triggerEvent(events, 'CornerstoneImageCacheFull', cacheInfo);
}

export function putImagePromise (imageId, imagePromise) {
  if (imageId === undefined) {
    throw new Error('putImagePromise: imageId must not be undefined');
  }
  if (imagePromise === undefined) {
    throw new Error('putImagePromise: imagePromise must not be undefined');
  }
  if (imageCacheDict.hasOwnProperty(imageId) === true) {
    throw new Error('putImagePromise: imageId already in cache');
  }

  const cachedImage = {
    loaded: false,
    imageId,
    sharedCacheKey: undefined, // The sharedCacheKey for this imageId.  undefined by default
    imagePromise,
    timeStamp: Date.now(),
    sizeInBytes: 0
  };

  imageCacheDict[imageId] = cachedImage;
  cachedImages.push(cachedImage);

  imagePromise.then(function (image) {
    if (cachedImages.indexOf(cachedImage) === -1) {
      // If the image has been purged before being loaded, we stop here.
      return;
    }

    cachedImage.loaded = true;
    cachedImage.image = image;

    if (image.sizeInBytes === undefined) {
      throw new Error('putImagePromise: sizeInBytes must not be undefined');
    }
    if (image.sizeInBytes.toFixed === undefined) {
      throw new Error('putImagePromise: image.sizeInBytes is not a number');
    }

    cachedImage.sizeInBytes = image.sizeInBytes;
    cacheSizeInBytes += cachedImage.sizeInBytes;

    const eventDetails = {
      action: 'addImage',
      image: cachedImage
    };

    triggerEvent(events, 'CornerstoneImageCacheChanged', eventDetails);

    cachedImage.sharedCacheKey = image.sharedCacheKey;

    purgeCacheIfNecessary();
  });
}

export function getImagePromise (imageId) {
  if (imageId === undefined) {
    throw new Error('getImagePromise: imageId must not be undefined');
  }
  const cachedImage = imageCacheDict[imageId];

  if (cachedImage === undefined) {
    return;
  }

  // Bump time stamp for cached image
  cachedImage.timeStamp = Date.now();

  return cachedImage.imagePromise;
}

export function removeImagePromise (imageId) {
  if (imageId === undefined) {
    throw new Error('removeImagePromise: imageId must not be undefined');
  }
  const cachedImage = imageCacheDict[imageId];

  if (cachedImage === undefined) {
    throw new Error('removeImagePromise: imageId was not present in imageCache');
  }

  cachedImage.imagePromise.reject();
  cachedImages.splice(cachedImages.indexOf(cachedImage), 1);
  cacheSizeInBytes -= cachedImage.sizeInBytes;

  const eventDetails = {
    action: 'deleteImage',
    image: cachedImage
  };

  triggerEvent(events, 'CornerstoneImageCacheChanged', eventDetails);
  decache(cachedImage.imagePromise);

  delete imageCacheDict[imageId];
}

export function getCacheInfo () {
  return {
    maximumSizeInBytes,
    cacheSizeInBytes,
    numberOfImagesCached: cachedImages.length
  };
}

// This method should only be called by `removeImagePromise` because it's
// The one that knows how to deal with shared cache keys and cache size.
function decache (imagePromise) {
  imagePromise.then(function (image) {
    if (image.decache) {
      image.decache();
    }
  });
}

export function purgeCache () {
  while (cachedImages.length > 0) {
    const removedCachedImage = cachedImages[0];

    removeImagePromise(removedCachedImage.imageId);
  }
}

export function changeImageIdCacheSize (imageId, newCacheSize) {
  const cacheEntry = imageCacheDict[imageId];

  if (cacheEntry) {
    cacheEntry.imagePromise.then(function (image) {
      const cacheSizeDifference = newCacheSize - image.sizeInBytes;

      image.sizeInBytes = newCacheSize;
      cacheEntry.sizeInBytes = newCacheSize;
      cacheSizeInBytes += cacheSizeDifference;

      const eventDetails = {
        action: 'changeImageSize',
        image
      };

      triggerEvent(events, 'CornerstoneImageCacheChanged', eventDetails);
    });
  }
}

export default {
  imageCache: imageCacheDict,
  cachedImages,
  setMaximumSizeBytes,
  putImagePromise,
  getImagePromise,
  removeImagePromise,
  getCacheInfo,
  purgeCache,
  changeImageIdCacheSize
};
