(function(cornerstone) {

    "use strict";

    function getPixelValues(pixelData) {
        var minPixelValue = Number.MAX_VALUE;
        var maxPixelValue = Number.MIN_VALUE;
        var len = pixelData.length;
        var pixel;

        for(var i = 0; i < len; i++) {
            pixel = pixelData[i];
            minPixelValue = minPixelValue < pixel ? minPixelValue : pixel;
            maxPixelValue = maxPixelValue > pixel ? maxPixelValue : pixel;
        }

        return {
            minPixelValue: minPixelValue,
            maxPixelValue: maxPixelValue
        };
    }

    function getRestoreImageMethod(image) {
        if(image.restore) {
            return image.restore;
        }

        var color = image.color;
        var rgba = image.rgba;
        var lut = image.lut;
        var slope = image.slope;
        var windowWidth = image.windowWidth;
        var windowCenter = image.windowCenter;
        var minPixelValue = image.minPixelValue;
        var maxPixelValue = image.maxPixelValue;

        return function() {
            image.color = color;
            image.rgba = rgba;
            image.lut = lut;
            image.slope = slope;
            image.windowWidth = windowWidth;
            image.windowCenter = windowCenter;
            image.minPixelValue = minPixelValue;
            image.maxPixelValue = maxPixelValue;

            if(image.origPixelData) {
                var pixelData = image.origPixelData;
                image.getPixelData = function() {
                    return pixelData;
                };
            }

            // Remove some attributes added by false color mapping
            delete image.origPixelData;
            delete image.colormapId;
            delete image.falseColor;
        };
    }

    // User can pass a colormap or its id as string to some of these public functions.
    // Then we need to make sure it will be converted into a colormap object if it's as string.
    function ensuresColormap(colormap) {
        if(colormap && (typeof colormap === 'string')) {
            colormap = cornerstone.colors.getColormap(colormap);
        }

        return colormap;
    }

    /**
     * Restores a false color image to its original version
     * @param image
     */
    function restoreImage(image) {
        if(image.restore && (typeof image.restore === 'function')) {
            image.restore();
            return true;
        }

        return false;
    }

    /**
     * Convert an image to a false color image
     * @param image
     * @param colormap - it can be a colormap object or a colormap id (string)
     */
    function convertImageToFalseColorImage(image, colormap) {
        if (image.color && !image.falseColor) {
            throw "Color transforms are not implemented yet";
        }

        // User can pass a colormap id or a colormap object
        colormap = ensuresColormap(colormap);

        var colormapId = colormap.getId();

        // Doesn't do anything if colormapId hasn't changed
        if(image.colormapId === colormapId) {
            // It has already being converted into a false color image
            // using the colormapId passed as parameter
            return false;
        }

        // Restore the image attributes updated when converting to a false color image
        restoreImage(image);

        // Convert the image to a false color image
        if(colormapId) {
            var minPixelValue = image.minPixelValue || 0;
            var maxPixelValue = image.maxPixelValue || 255;
            var lookupTable;

            image.restore = getRestoreImageMethod(image);
            // cacheOriginalImageAttrs(image);

            // var colormap = cornerstone.colors.getColormap(colormapId);
            lookupTable = colormap.createLookupTable();
            lookupTable.setTableRange(minPixelValue, maxPixelValue);

            // Update the pixel data and render the new image
            cornerstone.pixelDataToFalseColorData(image, lookupTable);

            // Update min and max pixel values
            var pixelValues = getPixelValues(image.getPixelData());
            image.minPixelValue = pixelValues.minPixelValue;
            image.maxPixelValue = pixelValues.maxPixelValue;

            // Cache the last colormapId used for performance
            // then it doesn't need to be re-rendered on next
            // time if the user hasn't updated it
            image.colormapId = colormapId;
        }

        // Return `true` to tell the caller that the image has got updated
        return true;
    }

    /**
     * Convert the image of a element to a false color image
     * @param element
     * @param colormap - it can be a colormap object or a colormap id (string)
     */
    function convertToFalseColorImage(element, colormap) {
        var enabledElement = cornerstone.getEnabledElement(element);
        var falseColorImageUpdated = convertImageToFalseColorImage(enabledElement.image, colormap);

        if(falseColorImageUpdated) {
            cornerstone.updateImage(element, true);
        }
    }

    cornerstone.convertImageToFalseColorImage = convertImageToFalseColorImage;
    cornerstone.convertToFalseColorImage = convertToFalseColorImage;
    cornerstone.restoreImage = restoreImage;
}(cornerstone));
