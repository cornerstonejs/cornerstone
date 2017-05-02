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
    throw 'setMaximumSizeBytes: parameter numBytes must not be undefined';
  }
  if (numBytes.toFixed === undefined) {
    throw 'setMaximumSizeBytes: parameter numBytes must be a number';
  }

  maximumSizeInBytes = numBytes;
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

    // Remove images as necessary
  while (cacheSizeInBytes > maximumSizeInBytes) {
    const lastCachedImage = cachedImages[cachedImages.length - 1];
    const imageId = lastCachedImage.imageId;

    removeImagePromise(imageId);

    $(cornerstone).trigger('CornerstoneImageCachePromiseRemoved', { imageId });
  }

  const cacheInfo = getCacheInfo();

  $(cornerstone).trigger('CornerstoneImageCacheFull', cacheInfo);
}

export function putImagePromise (imageId, imagePromise) {
  if (imageId === undefined) {
    throw 'getImagePromise: imageId must not be undefined';
  }
  if (imagePromise === undefined) {
    throw 'getImagePromise: imagePromise must not be undefined';
  }

  if (imageCacheDict.hasOwnProperty(imageId) === true) {
    throw 'putImagePromise: imageId already in cache';
  }

  const cachedImage = {
    loaded: false,
    imageId,
    sharedCacheKey: undefined, // The sharedCacheKey for this imageId.  undefined by default
    imagePromise,
    timeStamp: new Date(),
    sizeInBytes: 0
  };

  imageCacheDict[imageId] = cachedImage;
  cachedImages.push(cachedImage);

  imagePromise.then(function (image) {
    cachedImage.loaded = true;
    cachedImage.image = image;

    if (image.sizeInBytes === undefined) {
      throw 'putImagePromise: image does not have sizeInBytes property or';
    }
    if (image.sizeInBytes.toFixed === undefined) {
      throw 'putImagePromise: image.sizeInBytes is not a number';
    }

    cachedImage.sizeInBytes = image.sizeInBytes;
    cacheSizeInBytes += cachedImage.sizeInBytes;
    cachedImage.sharedCacheKey = image.sharedCacheKey;

    purgeCacheIfNecessary();
  });
}

export function getImagePromise (imageId) {
  if (imageId === undefined) {
    throw 'getImagePromise: imageId must not be undefined';
  }
  const cachedImage = imageCacheDict[imageId];

  if (cachedImage === undefined) {
    return;
  }

    // Bump time stamp for cached image
  cachedImage.timeStamp = new Date();

  return cachedImage.imagePromise;
}

export function removeImagePromise (imageId) {
  if (imageId === undefined) {
    throw 'removeImagePromise: imageId must not be undefined';
  }
  const cachedImage = imageCacheDict[imageId];

  if (cachedImage === undefined) {
    throw 'removeImagePromise: imageId must not be undefined';
  }

  cachedImage.imagePromise.reject();
  cachedImages.splice(cachedImages.indexOf(cachedImage), 1);
  cacheSizeInBytes -= cachedImage.sizeInBytes;
  decache(cachedImage.imagePromise, cachedImage.imageId);

  delete imageCacheDict[imageId];

  return cachedImage.imagePromise;
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
function decache (imagePromise, imageId) {
  imagePromise.then(function (image) {
    if (image.decache) {
      image.decache();
    }
  }).always(function () {
    delete imageCacheDict[imageId];
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
      cacheSizeInBytes += cacheSizeDifference;
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
