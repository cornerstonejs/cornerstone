/*! cornerstoneWebImageLoader - v0.5.0 - 2015-07-27 | (c) 2015 Chris Hafey | https://github.com/chafey/cornerstoneWebImageLoader */
cornerstoneWebImageLoader = {};
//
// This is a cornerstone image loader for web images such as PNG and JPEG
//

(function ($, cornerstone, cornerstoneWebImageLoader) {

    "use strict";

    var canvas = document.createElement('canvas');
    var lastImageIdDrawn = "";


    var options = {
      // callback allowing customization of the xhr (e.g. adding custom auth headers, cors, etc)
      beforeSend : function(xhr) {}
    };

    function createImageObject(image, imageId)
    {
        // extract the attributes we need
        var rows = image.naturalHeight;
        var columns = image.naturalWidth;

        function getPixelData()
        {
            var imageData = getImageData();
            var imageDataData = imageData.data;
            var numPixels = image.naturalHeight * image.naturalWidth;
            var storedPixelData = new Uint8Array(numPixels * 4);
            var imageDataIndex = 0;
            var storedPixelDataIndex = 0;
            for(var i=0; i < numPixels; i++) {
                storedPixelData[storedPixelDataIndex++] = imageDataData[imageDataIndex++];
                storedPixelData[storedPixelDataIndex++] = imageDataData[imageDataIndex++];
                storedPixelData[storedPixelDataIndex++] = imageDataData[imageDataIndex++];
                storedPixelData[storedPixelDataIndex++] = 255; // alpha
                imageDataIndex++;
            }
            return storedPixelData;
        }

        function getImageData()
        {
            var context;
            if(lastImageIdDrawn !== imageId) {
                canvas.height = image.naturalHeight;
                canvas.width = image.naturalWidth;
                context = canvas.getContext('2d');
                context.drawImage(image, 0, 0);
                lastImageIdDrawn = imageId;
            }
            else {
                context = canvas.getContext('2d');
            }
            var imageData = context.getImageData(0, 0, image.naturalWidth, image.naturalHeight);
            return imageData;
        }

        function getCanvas()
        {
            if(lastImageIdDrawn === imageId) {
                return canvas;
            }

            canvas.height = image.naturalHeight;
            canvas.width = image.naturalWidth;
            var context = canvas.getContext('2d');
            context.drawImage(image, 0, 0);
            lastImageIdDrawn = imageId;
            return canvas;
        }

        function getImage()
        {
            return image;
        }

        // Extract the various attributes we need
        var imageObject = {
            imageId : imageId,
            minPixelValue : 0, // calculated below
            maxPixelValue : 255, // calculated below
            slope: 1.0,
            intercept: 0,
            windowCenter : 127,
            windowWidth : 256,
            render: cornerstone.renderColorImage,
            getPixelData: getPixelData,
            getImageData: getImageData,
            getCanvas: getCanvas,
            getImage: getImage,
            //storedPixelData: extractStoredPixels(image),
            rows: rows,
            columns: columns,
            height: rows,
            width: columns,
            color: true,
            columnPixelSpacing: 1.0,
            rowPixelSpacing: 1.0,
            invert: false,
            sizeInBytes : rows * columns * 4 // we don't know for sure so we over estimate to be safe
        };

        return imageObject;
    }

    // Loads an image given a url to an image
    function loadImage(imageId) {

      // create a deferred object
      var deferred = $.Deferred();

      var image = new Image();

      var xhr = new XMLHttpRequest();
      xhr.responseType = "arraybuffer";
      xhr.open("GET", imageId, true);
      options.beforeSend(xhr);
      xhr.onload = function(e) {
        var arrayBufferView = new Uint8Array(this.response);
        var blob = new Blob([arrayBufferView], {type: "image/jpeg"});
        var urlCreator = window.URL || window.webkitURL;
        var imageUrl = urlCreator.createObjectURL(blob);
        image.src = imageUrl;
        image.onload = function() {
          var imageObject = createImageObject(image, imageId);
          deferred.resolve(imageObject);
          urlCreator.revokeObjectURL(imageUrl);
        };
        image.onerror = function() {
          urlCreator.revokeObjectURL(imageUrl);
          deferred.reject();
        };
      };
      xhr.send();
      return deferred;
    }

    function configure(opts) {
      options = opts;
    }

    // steam the http and https prefixes so we can use standard web urls directly
    cornerstone.registerImageLoader('http', loadImage);
    cornerstone.registerImageLoader('https', loadImage);
    cornerstoneWebImageLoader.configure = configure;
    return cornerstone;
}($, cornerstone, cornerstoneWebImageLoader));