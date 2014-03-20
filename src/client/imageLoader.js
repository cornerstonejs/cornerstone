var cornerstone = (function (cornerstone, csc) {
    if(cornerstone === undefined) {
        cornerstone = {};
    }

    var imageCache = {
    };

    function loadImage(imageId) {
        if(imageCache[imageId] === undefined) {
            // currently hardcoded to use example images only
            var image = cornerstone.getExampleImage(imageId);
            return image;
        }
        else {
            return imageCache[imageId];
        }
    };

    // module exports

    cornerstone.loadImage = loadImage;

    return cornerstone;
}(cornerstone, cornerstoneCore));