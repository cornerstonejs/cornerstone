/* eslint-disable no-unused-expressions */
import { assert } from 'chai';

import { registerImageLoader,
       registerUnknownImageLoader,
       loadImage,
       loadAndCacheImage } from '../src/index';

describe('imageLoader registration module', function () {
  beforeEach(function () {
    this.exampleImageLoader1 = (imageId, options) => {
      console.log('loading via exampleImageLoader1');
      console.log(options);

      return $.Deferred();
    };

    this.exampleImageLoader2 = (imageId, options) => {
      console.log('loading via exampleImageLoader2');
      console.log(options);

      return $.Deferred();
    };

    this.exampleScheme1 = 'example1';
    this.exampleScheme2 = 'example2';

    this.exampleScheme1ImageId = `${this.exampleScheme1}://image1`;
    this.exampleScheme2ImageId = `${this.exampleScheme2}://image2`;

    this.options = {};
  });

  it('allows registration of new image loader', function () {
    registerImageLoader(this.exampleScheme1, this.exampleImageLoader1);
    registerImageLoader(this.exampleScheme2, this.exampleImageLoader2);

    const imagePromise1 = loadImage(this.exampleScheme1ImageId, this.options);

    assert.isDefined(imagePromise1);

    const imagePromise2 = loadImage(this.exampleScheme2ImageId, this.options);

    assert.isDefined(imagePromise2);
  });

  it('allows registration of unknown image loader', function () {
    let oldUnknownImageLoader = registerUnknownImageLoader(this.exampleImageLoader1);

    assert.isUndefined(oldUnknownImageLoader);

    // Check that it returns the old value for the unknown image loader
    oldUnknownImageLoader = registerUnknownImageLoader(this.exampleImageLoader1);
    assert.equal(oldUnknownImageLoader, this.exampleImageLoader1);
  });
});

describe('imageLoader loading module', function () {
  beforeEach(function () {
    this.exampleImageLoader1 = (imageId, options) => {
      console.log('loading via exampleImageLoader1');
      console.log(options);

      return $.Deferred();
    };

    this.exampleImageLoader2 = (imageId, options) => {
      console.log('loading via exampleImageLoader2');
      console.log(options);

      return $.Deferred();
    };

    this.exampleScheme1 = 'example1';
    this.exampleScheme2 = 'example2';

    this.exampleScheme1ImageId = `${this.exampleScheme1}://image1`;
    this.exampleScheme2ImageId = `${this.exampleScheme2}://image2`;

    this.options = {};
  });

  it('allows loading with storage in image cache (loadImage)', function () {
    registerImageLoader(this.exampleScheme1, this.exampleImageLoader1);
    const imagePromise1 = loadImage(this.exampleScheme1ImageId, this.options);

    assert.isDefined(imagePromise1);
  });

  it('allows loading without storage in image cache (loadAndCacheImage)', function () {
    registerImageLoader(this.exampleScheme1, this.exampleImageLoader1);
    const imagePromise1 = loadAndCacheImage(this.exampleScheme1ImageId, this.options);

    assert.isDefined(imagePromise1);
  });

  it('falls back to the unknownImageLoader if no appropriate scheme is present', function () {
    registerImageLoader(this.exampleScheme1, this.exampleImageLoader1);
    registerUnknownImageLoader(this.exampleScheme2, this.exampleImageLoader2);
    const imagePromise1 = loadAndCacheImage(this.exampleScheme2ImageId, this.options);

    assert.isDefined(imagePromise1);
  });
});

