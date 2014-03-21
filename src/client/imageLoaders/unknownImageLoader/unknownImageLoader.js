//
// This image loader returns a blank/black image.  It registers itself with cornerstone
// as the unknown image loader which means it will be called when cornerstone is given an
// imageId with a scheme it doesn't have a plugin for.  Since this shouldn't happen normally,
// we opt to return a blank image rather than return an error to the higher level code
// which couldn't do anything about the error anyway and makes it more complex.
//

(function (cornerstone) {

    // Loads an image given an imageId
    // TODO: make this api async?
    function loadImage(imageId) {
        var image = {
            minPixelValue : 0,
            maxPixelValue : 255,
            slope: 1.0,
            intercept: 0,
            windowCenter : 127,
            windowWidth : 256,
            storedPixelData: [], // generated below
            rows: 256,
            columns: 256,
            color: false
        };

        var index=0;
        for(var row=0; row < image.rows; row++) {
            for(var column=0; column < image.columns; column++) {
                image.storedPixelData[index] = 0;
                index++;
            }
        }

        // write something into the image saying "internal error?"

    };

    cornerstone.registerUnknownImageLoader(loadImage);

}(cornerstone));