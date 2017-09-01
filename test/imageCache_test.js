import { assert } from 'chai';

import { setMaximumSizeBytes,
         putImagePromise,
         getImagePromise,
         removeImagePromise,
         getCacheInfo,
         purgeCache,
         changeImageIdCacheSize } from '../src/imageCache.js';

import pubSub from '../src/pubSub.js';

describe('Set maximum cache size', function () {
  it('should allow setting of cache size', function () {
    // Arrange
    const maximumSizeInBytes = 1024 * 1024 * 1024;

    // Act
    setMaximumSizeBytes(maximumSizeInBytes);

    // Assert
    const cacheInfo = getCacheInfo();

    assert.equal(cacheInfo.maximumSizeInBytes, maximumSizeInBytes);
  });

  it('should fail if numBytes is not defined', function () {
    assert.throws(() => setMaximumSizeBytes(undefined));
  });

  it('should fail if numBytes is not a number', function () {
    assert.throws(() => setMaximumSizeBytes('10000'));
  });
});

describe('Store, retrieve, and remove imagePromises from the cache', function () {
  before(function () {
    // Act
    purgeCache();
  });

  beforeEach(function () {
    // Arrange
    this.image = {
      imageId: 'anImageId',
      sizeInBytes: 100
    };
    this.imagePromise = Promise.resolve(this.image);

    purgeCache();
  });

  it('should allow image promises to be added to the cache (putImagePromise)', function () {
    // Act
    putImagePromise(this.image.imageId, this.imagePromise);

    // Assert
    return this.imagePromise.then(() => {
      const cacheInfo = getCacheInfo();

      assert.equal(cacheInfo.numberOfImagesCached, 1);
      assert.equal(cacheInfo.cacheSizeInBytes, this.image.sizeInBytes);
    });
  });

  it('should throw an error if sizeInBytes is undefined (putImagePromise)', function (done) {
    // Arrange
    this.image.sizeInBytes = undefined;

    // Assert
    assert.throws(() => {
      // Act
      putImagePromise(this.image.imageId, this.imagePromise);
      done();
    });
  });

  it('should throw an error if sizeInBytes is not a number (putImagePromise)', function (done) {
    // Arrange
    this.image.sizeInBytes = '10000';

    // Assert
    assert.throws(() => {
      // Act
      putImagePromise(this.image.imageId, this.imagePromise);
      done();
    });
  });

  it('should throw an error if imageId is not defined (putImagePromise)', function () {
    // Assert
    assert.throws(() => putImagePromise(undefined, this.imagePromise));
  });

  it('should throw an error if imagePromise is not defined (putImagePromise)', function () {
    // Assert
    assert.throws(() => putImagePromise(this.image.imageId, undefined));
  });

  it('should throw an error if imageId is already in the cache (putImagePromise)', function () {
    // Arrange
    putImagePromise(this.image.imageId, this.imagePromise);

    // Assert
    assert.throws(() => putImagePromise(this.image.imageId, this.imagePromise));
  });

  it('should allow image promises to be retrieved from the cache (getImagePromise)', function () {
    // Act
    putImagePromise(this.image.imageId, this.imagePromise);

    // Assert
    const retrievedPromise = getImagePromise(this.image.imageId);

    assert.equal(this.imagePromise, retrievedPromise);
  });

  it('should throw an error if imageId is not defined (getImagePromise)', function () {
    // Assert
    assert.throws(() => getImagePromise(undefined));
  });

  it('should fail silently to retrieve a promise for an imageId not in the cache', function () {
    // Act
    const retrievedPromise = getImagePromise('AnImageIdNotInCache');

    // Assert
    assert.isUndefined(retrievedPromise, undefined);
  });

  it('should allow image promises to be removed from the cache (removeImagePromise)', function () {
    // Arrange
    putImagePromise(this.image.imageId, this.imagePromise);

    // Act
    removeImagePromise(this.image.imageId);

    // Assert
    // Make sure that the cache is now empty
    const cacheInfo = getCacheInfo();

    assert.equal(cacheInfo.numberOfImagesCached, 0);
    assert.equal(cacheInfo.cacheSizeInBytes, 0);
  });

  it('should fail if imageId is not defined (removeImagePromise)', function () {
    assert.throws(() => removeImagePromise(undefined));
  });

  it('should fail if imageId is not in cache (removeImagePromise)', function () {
    assert.throws(() => removeImagePromise('RandomImageId'));
  });

  it('should allow image promises to have their cache size changed', function () {
    // Arrange
    putImagePromise(this.image.imageId, this.imagePromise);
    const newCacheSize = 500;

    // Act
    changeImageIdCacheSize(this.image.imageId, newCacheSize);

    // Assert
    return this.imagePromise.then(function () {
      const cacheInfo = getCacheInfo();

      assert.equal(cacheInfo.numberOfImagesCached, 1);
      assert.equal(cacheInfo.cacheSizeInBytes, newCacheSize);
    });
  });

  it('should be able to purge the entire cache', function () {
    // Arrange
    putImagePromise(this.image.imageId, this.imagePromise);

    // Act
    purgeCache();

    // Assert
    const cacheInfo = getCacheInfo();

    assert.equal(cacheInfo.numberOfImagesCached, 0);

    return this.imagePromise.then(function () {
      assert.equal(cacheInfo.cacheSizeInBytes, 0);
    });
  });

  it('should be able to detect if the cache is full', function (done) {
    // Arrange
    setMaximumSizeBytes(1000);

    for (let i = 0; i < 10; i++) {
      // Create the image
      const image = {
        imageId: `imageId-${i}`,
        sizeInBytes: 100
      };
      const imagePromise = Promise.resolve(image);

      // Add it to the cache
      putImagePromise(image.imageId, imagePromise);
    }

    const token = pubSub().subscribe('CornerstoneImageCacheFull', (event, cacheInfo) => {
      pubSub().unsubscribe(token);

      const currentInfo = getCacheInfo();

      assert.deepEqual(cacheInfo, currentInfo);
      done();
    });

    // Act
    // Create another image which will push us over the cache limit
    const extraImage = {
      imageId: 'imageId-11',
      sizeInBytes: 100
    };
    const extraImagePromise = Promise.resolve(extraImage);

    // Add it to the cache
    putImagePromise(extraImage.imageId, extraImagePromise);
  });

  it('should be able to detect if the cache was cleaned', function (done) {
    // Arrange
    setMaximumSizeBytes(1000);

    for (let i = 0; i < 10; i++) {
      // Create the image
      const image = {
        imageId: `imageId-${i}`,
        sizeInBytes: 100
      };
      const imagePromise = Promise.resolve(image);

      // Add it to the cache
      putImagePromise(image.imageId, imagePromise);
    }

    const token = pubSub().subscribe('CornerstoneImageCacheCleaned', (event, cacheInfo) => {
      pubSub().unsubscribe(token);

      const currentInfo = getCacheInfo();

      assert.deepEqual(cacheInfo, currentInfo);
      assert.equal(cacheInfo.numberOfImagesCached, 10);
      assert.equal(cacheInfo.cacheSizeInBytes, 1000);

      done();
    });

    // Act
    // Create another image which will push us over the cache limit
    const extraImage = {
      imageId: 'imageId-11',
      sizeInBytes: 100
    };
    const extraImagePromise = Promise.resolve(extraImage);

    // Add it to the cache
    putImagePromise(extraImage.imageId, extraImagePromise);
  });

  it('should be able to kick the oldest image out of the cache', function (done) {
    // Arrange
    setMaximumSizeBytes(1000);

    // Put images to cache until it is full
    for (let i = 0; i < 10; i++) {
      const image = {
        imageId: `imageId-${i + 1}`,
        sizeInBytes: 100
      };
      const imagePromise = Promise.resolve(image);

      putImagePromise(image.imageId, imagePromise);
    }

    // Setup event listeners to check that the promise removed and cache full events have fired properly
    const token = pubSub().subscribe('CornerstoneImageCachePromiseRemoved', (event, imageId) => {
      pubSub().unsubscribe(token);

      // Assert
      // Detect that the earliest image added has been removed
      assert.equal(imageId, 'imageId-1');
      done();
    });

    // Act
    // Create another image which will push us over the cache limit
    const extraImage = {
      imageId: 'imageId-11',
      sizeInBytes: 100
    };
    const extraImagePromise = Promise.resolve(extraImage);

    setTimeout(function () {
      // Make sure 'imageId-0' really has the oldest timestamp
      for (let i = 1; i < 11; i++) {
        getImagePromise(`imageId-${i + 1}`);
      }

      // Add the extra image to the cache
      putImagePromise(extraImage.imageId, extraImagePromise);
    }, 1);
  });
});
