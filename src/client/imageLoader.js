var cornerstone = (function (cornerstone, csc) {
    if(cornerstone === undefined) {
        cornerstone = {};
    }

    var imageCache = {
    };

    function loadImage(imageId) {
        if(imageCache[imageId] === undefined) {
            var colonIndex = imageId.indexOf(":");
            var scheme = imageId.substring(0, colonIndex);
            var loader = cornerstone.imageIdSchemes[scheme];
            var image = loader(imageId);
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