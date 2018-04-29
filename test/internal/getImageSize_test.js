import { should, expect } from 'chai'; // eslint-disable-line import/extensions

import getImageSize from '../../src/internal/getImageSize.js';

should();

describe('getImageSize', function () {

  describe('when image parameters is not passed', function () {
    it('should throw an error', function () {

      expect(function () {
        getImageSize();
      }).to.throw('getImageSize: parameter image must not be undefined');

      expect(function () {
        getImageSize({ width: 50 });
      }).to.throw('getImageSize: parameter image must have height');

      expect(function () {
        getImageSize({ height: 100 });
      }).to.throw('getImageSize: parameter image must have width');
    });
  });

  describe('when an image is passed with no rotation', function () {
    it('should return the image width/height', function () {
      const image = {
        width: 50,
        height: 100
      };

      const imageSizeNoRotationParameter = getImageSize(image);
      const imageSize0RotationParameter = getImageSize(image, 0);
      const imageSize180RotationParameter = getImageSize(image, 180);

      imageSizeNoRotationParameter.should.be.deep.equal(image);
      imageSize0RotationParameter.should.be.deep.equal(image);
      imageSize180RotationParameter.should.be.deep.equal(image);
    });
  });

  describe('when an image is passed rotated', function () {
    it('should return the image width/height rotated', function () {
      const image = {
        width: 50,
        height: 100
      };

      const returnedImageSize = getImageSize(image, 90);

      // rotate
      image.width = 100;
      image.height = 50;

      returnedImageSize.should.be.deep.equal(image);
    });
  });
});
