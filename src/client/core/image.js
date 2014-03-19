
var cornerstoneCore = (function (cornerstoneCore) {
    if(cornerstoneCore === undefined) {
        cornerstoneCore = {};
    }

    function image()
    {
        var image = {
            minPixelValue : 0,
            maxPixelValue : 257,
            slope: 1.0,
            intercept: 0,
            windowCenter : 127,
            windowWidth : 256,
            storedPixelData: [], // generated below
            rows: 256,
            columns: 256
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

    // Module exports
    cornerstoneCore.image = image;

    return cornerstoneCore;
}(cornerstoneCore));