//
// This is a cornerstone imageLoader that generates test images.  These test images
// are useful for debugging as they don't require a server
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
            columns: 128,
            color: false,
            columnPixelSpacing: 1.0,
            rowPixelSpacing: 1.0
        };

        var index=0;
        var rnd = Math.round(Math.random() * 255);
        for(var row=0; row < image.rows; row++) {
            for(var column=0; column < image.columns; column++) {
                image.storedPixelData[index] = (rnd + index) % 256;
                index++;
            }
        }

        return image;
    };

    cornerstone.registerImageLoader('test', loadImage);

    return cornerstone;
}(cornerstone));