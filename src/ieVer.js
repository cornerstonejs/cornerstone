/**
 * This module contains functions to deal with getting and setting the viewport for an enabled element
 */
var cornerstone = (function (cornerstone) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
    }

    // Turn off jshint warnings about new Number() in borrowed code below
    /*jshint -W053 */

    // Taken from : http://stackoverflow.com/questions/17907445/how-to-detect-ie11
    function ie_ver(){
        var iev=0;
        var ieold = (/MSIE (\d+\.\d+);/.test(navigator.userAgent));
        var trident = !!navigator.userAgent.match(/Trident\/7.0/);
        var rv=navigator.userAgent.indexOf("rv:11.0");

        if (ieold) iev=new Number(RegExp.$1);
        if (navigator.appVersion.indexOf("MSIE 10") != -1) iev=10;
        if (trident&&rv!=-1) iev=11;

        return iev;
    }

    // module/private exports
    cornerstone.ieVersion = ie_ver;

    return cornerstone;
}(cornerstone));