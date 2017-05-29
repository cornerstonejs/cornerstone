/**
 * This module deals with caching image textures in VRAM for WebGL
 */

const imageCache = {};

const cachedImages = [];

let maximumSizeInBytes = 1024 * 1024 * 256; // 256 MB
let cacheSizeInBytes = 0;

function getCacheInfo () {
  return {
    maximumSizeInBytes,
    cacheSizeInBytes,
    numberOfImagesCached: cachedImages.length
  };
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

    cacheSizeInBytes -= lastCachedImage.sizeInBytes;
    delete imageCache[lastCachedImage.imageId];
    cachedImages.pop();

    $(cornerstone).trigger('CornerstoneWebGLTextureRemoved', { imageId: lastCachedImage.imageId });
  }

  const cacheInfo = getCacheInfo();

  $(cornerstone).trigger('CornerstoneWebGLTextureCacheFull', cacheInfo);
}

function setMaximumSizeBytes (numBytes) {
  if (numBytes === undefined) {
    throw new Error('setMaximumSizeBytes: parameter numBytes must not be undefined');
  }
  if (numBytes.toFixed === undefined) {
    throw new Error('setMaximumSizeBytes: parameter numBytes must be a number');
  }

  maximumSizeInBytes = numBytes;
  purgeCacheIfNecessary();
}

function putImageTexture (image, imageTexture) {
  const imageId = image.imageId;

  if (image === undefined) {
    throw new Error('putImageTexture: image must not be undefined');
  }

  if (imageId === undefined) {
    throw new Error('putImageTexture: imageId must not be undefined');
  }

  if (imageTexture === undefined) {
    throw new Error('putImageTexture: imageTexture must not be undefined');
  }

  if (Object.prototype.hasOwnProperty.call(imageCache, imageId) === true) {
    throw new Error('putImageTexture: imageId already in cache');
  }

  const cachedImage = {
    imageId,
    imageTexture,
    timeStamp: new Date(),
    sizeInBytes: imageTexture.sizeInBytes
  };

  imageCache[imageId] = cachedImage;
  cachedImages.push(cachedImage);

  if (imageTexture.sizeInBytes === undefined) {
    throw new Error('putImageTexture: imageTexture.sizeInBytes must not be undefined');
  }
  if (imageTexture.sizeInBytes.toFixed === undefined) {
    throw new Error('putImageTexture: imageTexture.sizeInBytes is not a number');
  }
  cacheSizeInBytes += cachedImage.sizeInBytes;
  purgeCacheIfNecessary();
}

function getImageTexture (imageId) {
  if (imageId === undefined) {
    throw new Error('getImageTexture: imageId must not be undefined');
  }
  const cachedImage = imageCache[imageId];

  if (cachedImage === undefined) {
    return;
  }

    // Bump time stamp for cached image
  cachedImage.timeStamp = new Date();

  return cachedImage.imageTexture;
}

function removeImageTexture (imageId) {
  if (imageId === undefined) {
    throw new Error('removeImageTexture: imageId must not be undefined');
  }
  const cachedImage = imageCache[imageId];

  if (cachedImage === undefined) {
    throw new Error('removeImageTexture: imageId must not be undefined');
  }
  cachedImages.splice(cachedImages.indexOf(cachedImage), 1);
  cacheSizeInBytes -= cachedImage.sizeInBytes;
  delete imageCache[imageId];

  return cachedImage.imageTexture;
}

function purgeCache () {
  while (cachedImages.length > 0) {
    const removedCachedImage = cachedImages.pop();

    delete imageCache[removedCachedImage.imageId];
  }
  cacheSizeInBytes = 0;
}

export default {
  purgeCache,
  getImageTexture,
  putImageTexture,
  removeImageTexture,
  setMaximumSizeBytes
};
