/**
 * This module deals with ImageLoaders, loading images and caching images
 */
import { getImagePromise, putImagePromise } from './imageCache.js';

const imageLoaders = {};

let unknownImageLoader;

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

    return;

  }
  imagePromise = loader(imageId, options);

  // Broadcast an image loaded event once the image is loaded
  imagePromise.then(function (image) {
    $(cornerstone).trigger('CornerstoneImageLoaded', { image });
  });

  return imagePromise;
}

// Loads an image given an imageId and optional priority and returns a promise which will resolve
// To the loaded image object or fail if an error occurred.  The loaded image
// Is not stored in the cache
export function loadImage (imageId, options) {
  if (imageId === undefined) {
    throw 'loadImage: parameter imageId must not be undefined';
  }

  let imagePromise = getImagePromise(imageId);

  if (imagePromise !== undefined) {
    return imagePromise;
  }

  imagePromise = loadImageFromImageLoader(imageId, options);
  if (imagePromise === undefined) {
    throw 'loadImage: no image loader for imageId';
  }

  return imagePromise;
}

// Loads an image given an imageId and optional priority and returns a promise which will resolve
// To the loaded image object or fail if an error occurred.  The image is
// Stored in the cache
export function loadAndCacheImage (imageId, options) {
  if (imageId === undefined) {
    throw 'loadAndCacheImage: parameter imageId must not be undefined';
  }

  let imagePromise = getImagePromise(imageId);

  if (imagePromise !== undefined) {
    return imagePromise;
  }

  imagePromise = loadImageFromImageLoader(imageId, options);
  if (imagePromise === undefined) {
    throw 'loadAndCacheImage: no image loader for imageId';
  }

  putImagePromise(imageId, imagePromise);

  return imagePromise;
}


// Registers an imageLoader plugin with cornerstone for the specified scheme
export function registerImageLoader (scheme, imageLoader) {
  imageLoaders[scheme] = imageLoader;
}

// Registers a new unknownImageLoader and returns the previous one (if it exists)
export function registerUnknownImageLoader (imageLoader) {
  const oldImageLoader = unknownImageLoader;

  unknownImageLoader = imageLoader;

  return oldImageLoader;
}
