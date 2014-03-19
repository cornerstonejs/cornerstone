
var cornerstoneCore = (function (cornerstoneCore) {
    if(cornerstoneCore === undefined) {
        cornerstoneCore = {};
    }

    function readPixelData(url, cb)
    {
        var oReq = new XMLHttpRequest();
        oReq.open("get", url, true);
        oReq.responseType = "arraybuffer";
        oReq.onload = function (oEvent) {
            cb(oReq.response);
        };
        oReq.send();
    };

    // Module exports
    cornerstoneCore.readPixelData = readPixelData;

    return cornerstoneCore;
}(cornerstoneCore));