
var cornerstoneCore = (function (cornerstoneCore) {
    if(cornerstoneCore === undefined) {
        cornerstoneCore = {};
    }

    function distanceSquared(pt1, pt2)
    {
        var dx = pt1.x - pt2.x;
        var dy = pt1.y - pt2.y;
        return dx * dx + dy * dy;
    };

    function distance(pt1, pt2)
    {
        var dx = pt1.x - pt2.x;
        var dy = pt1.y - pt2.y;
        return Math.sqrt(dx * dx + dy * dy);
    };

    // Module exports
    cornerstoneCore.distance = distance;
    cornerstoneCore.distanceSquared = distanceSquared;

    return cornerstoneCore;
}(cornerstoneCore));