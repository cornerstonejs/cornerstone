var cornerstone = (function (cs, csc) {

    "use strict";

    if(cs === undefined) {
        cs = {};
    }

    function getAttribute(ee, attrName) {
        var attr = ee.getAttribute(attrName);
        if(attr === undefined) {
            return undefined;
        }
        return attr;
    }

    function enableAllElements()
    {
        var ees = document.querySelectorAll('[data-cornerstoneEnabled]');
        for(var i=0; i < ees.length; i++) {
            var ee = ees[i];
            var imageId = ee.getAttribute('data-cornerstoneImageId');

            var viewport =
            {
                scale : getAttribute(ee, 'data-cornerstoneViewportScale'),
                centerX : getAttribute(ee, 'data-cornerstoneViewportCenterX'),
                centerY : getAttribute(ee, 'data-cornerstoneViewportCenterY'),
                windowWidth : getAttribute(ee, 'data-cornerstoneViewportWindowWidth'),
                windowCenter : getAttribute(ee, 'data-cornerstoneViewportWindowCenter')
            };
            cs.enable(ee, imageId, viewport);
        }
    }


    var oldOnLoad = window.onload;
    window.onload = function() {
        if(typeof oldOnLoad == 'function') {oldOnLoad();}
        enableAllElements();
    };

    cs.enableAllElements = enableAllElements;

    return cs;
}(cornerstone, cornerstoneCore));