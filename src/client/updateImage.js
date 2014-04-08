var cornerstone = (function (cornerstone, csc) {
    if(cornerstone === undefined) {
        cornerstone = {};
    }

    function updateImage(element) {
        var ee = cornerstone.getEnabledElement(element);
        var image = ee.image;
        // only draw the image if it has loaded
        if(image !== undefined) {
            csc.drawImage(ee, image);
        }
    };

    // module exports
    cornerstone.updateImage = updateImage;

    return cornerstone;
}(cornerstone, cornerstoneCore));