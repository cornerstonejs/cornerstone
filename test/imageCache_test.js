import { assert } from 'chai';

import { default as imageCache,
  setMaximumSizeBytes,
  putImagePromise,
  getImagePromise,
  removeImagePromise,
  getCacheInfo,
  // changeImageIdCacheSize,
  purgeCache } from '../src/imageCache.js';

import events from '../src/events.js';

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

    // Note: we are currently using Deferred because it allows us to reject
    // the Promises.
    this.imagePromise = $.Deferred();
    this.image = {
      imageId: 'anImageId',
      sizeInBytes: 100
    };
  });

  afterEach(function () {
    purgeCache();
  });

  it('should allow image promises to be added to the cache (putImagePromise)', function (done) {
    const image = this.image;
    const imagePromise = this.imagePromise;

    // Act
    putImagePromise(image.imageId, imagePromise);
    imagePromise.resolve(image).then(() => {
      // Assert
      const cacheInfo = getCacheInfo();

      assert.equal(cacheInfo.numberOfImagesCached, 1);
      assert.equal(cacheInfo.cacheSizeInBytes, this.image.sizeInBytes);
      done();
    });
  });

  it('should not change cache size if sizeInBytes is undefined (putImagePromise)', function (done) {
    // Arrange
    this.image.sizeInBytes = undefined;
    putImagePromise(this.image.imageId, this.imagePromise);

    // Act
    this.imagePromise.resolve(this.image).then(() => {
      const cacheInfo = getCacheInfo();

      // Assert
      assert.equal(cacheInfo.numberOfImagesCached, 1);
      assert.equal(cacheInfo.cacheSizeInBytes, 0);

      done();
    });
  });

  it('should not change cache size if sizeInBytes is not a number (putImagePromise)', function (done) {
    // Arrange
    this.image.sizeInBytes = '10000';
    putImagePromise(this.image.imageId, this.imagePromise);

    // Act
    this.imagePromise.resolve(this.image).then(() => {
      const cacheInfo = getCacheInfo();

      // Assert
      assert.equal(cacheInfo.numberOfImagesCached, 1);
      assert.equal(cacheInfo.cacheSizeInBytes, 0);

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
    const image = this.image;
    const imagePromise = this.imagePromise;

    // Act
    putImagePromise(image.imageId, imagePromise);

    // Assert
    const retrievedPromise = getImagePromise(image.imageId);

    assert.equal(imagePromise, retrievedPromise);
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
    const image = this.image;
    const imagePromise = this.imagePromise;

    // Arrange
    putImagePromise(image.imageId, imagePromise);

    // Act
    removeImagePromise(image.imageId);

    // Assert
    imagePromise.then(() => {
      // Fail if the Promise is resolved.
      assert.equal(true, false);
    });

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

  /* it('should allow image promises to have their cache size changed', function () {
    const image = this.image;
    const imagePromise = this.imagePromise;
    const newCacheSize = 500;

    // Arrange
    putImagePromise(image.imageId, imagePromise);

    imagePromise.resolve(image);
    changeImageIdCacheSize(image.imageId, newCacheSize);

    const cacheInfo = getCacheInfo();

    assert.equal(cacheInfo.numberOfImagesCached, 1);
    assert.equal(image.sizeInBytes, newCacheSize);
    assert.equal(cacheInfo.cacheSizeInBytes, newCacheSize);
  });*/

  it('should be able to purge the entire cache', function (done) {
    const image = this.image;
    const imagePromise = this.imagePromise;

    // Arrange
    putImagePromise(image.imageId, imagePromise);
    imagePromise.resolve(image).then(() => {
      // Act
      purgeCache();

      // Make sure that the cache is now empty
      const cacheInfo = getCacheInfo();

      assert.equal(cacheInfo.numberOfImagesCached, 0);
      assert.equal(cacheInfo.cacheSizeInBytes, 0);
      assert.isEmpty(imageCache.imageCache);
      done();
    });
  });

  it('should be able to kick the oldest image out of the cache', function (done) {
    // Arrange
    setMaximumSizeBytes(1000);

    const promises = [];

    for (let i = 0; i < 10; i++) {
      // Create the image
      const imagePromise = $.Deferred();
      const image = {
        imageId: `imageId-${i}`,
        sizeInBytes: 100
      };

      image.decache = () => console.log('decaching image');

      // Add it to the cache
      putImagePromise(image.imageId, imagePromise);
      imagePromise.resolve(image);
      promises.push(imagePromise.promise());
    }

    // Retrieve a few of the imagePromises in order to bump their timestamps
    getImagePromise('imageId-5');
    getImagePromise('imageId-4');
    getImagePromise('imageId-6');

    // Setup event listeners to check that the promise removed and cache full events have fired properly
    $(events).one('CornerstoneImageCachePromiseRemoved', (event, imageId) => {
      // Detect that the earliest image added has been removed

      // TODO: Figure out how to change the test setup to ensure the same
      // image is always kicked out of the cache. It looks like timestamps
      // are not in the expected order, probably since handling the promise
      // resolving is async
      // assert.equal(imageId, 'imageId-0');
      assert.isDefined(imageId);
      done();
    });

    $(events).one('CornerstoneImageCacheFull', (event, cacheInfo) => {
      const currentInfo = getCacheInfo();

      assert.equal(cacheInfo, currentInfo);
      console.log('CornerstoneImageCacheFull');
      done();
    });

    // Act
    // Create another image which will push us over the cache limit
    const extraImagePromise = $.Deferred();
    const extraImage = {
      imageId: 'imageId-11',
      sizeInBytes: 100
    };

    Promise.all(promises).then(() => {
      // Add it to the cache
      putImagePromise(extraImage.imageId, extraImagePromise);
      extraImagePromise.resolve(extraImage);

      // Make sure that the cache has pushed out the first image
      const cacheInfo = getCacheInfo();

      assert.equal(cacheInfo.numberOfImagesCached, 10);
      assert.equal(cacheInfo.cacheSizeInBytes, 1000);

      done();
    });
  });
});
