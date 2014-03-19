
var cornerstoneCore = (function (cornerstoneCore) {
    if(cornerstoneCore === undefined) {
        cornerstoneCore = {};
    }

    function generateLut(image)
    {
        var lut = [];

        for(var storedValue = image.minPixelValue; storedValue <= image.maxPixelValue; storedValue++)
        {
            var modalityLutValue = storedValue * image.slope + image.intercept;
            voiLutValue = (((modalityLutValue - (image.windowCenter)) / (image.windowWidth) + 0.5) * 255.0);
            var clampedValue = Math.min(Math.max(voiLutValue, 0), 255);
            lut[storedValue] = Math.round(clampedValue);
        }

        return lut;
    };


    // Module exports
    cornerstoneCore.generateLut = generateLut;

    return cornerstoneCore;
}(cornerstoneCore));