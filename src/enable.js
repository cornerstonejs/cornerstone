/**
 * This module is responsible for enabling an element to display images with cornerstone
 */
(function (cornerstone) {

    "use strict";

    function enable(element) {
        if(element === undefined) {
            throw "enable: parameter element cannot be undefined";
        }
        
        var renderer = document.createElement('div'); 
        renderer.className = 'cornerstone-renderer';

        var canvas = document.createElement('canvas');       
    
        renderer.appendChild(canvas);
        element.appendChild(renderer);

        /*
        var canvasAnnot = document.createElement('canvas');
        canvasAnnot.width = 512;
        canvasAnnot.height = 512;
        canvasAnnot.style.position = "absolute";
        canvasAnnot.style.top = 0;
        canvasAnnot.style.left = 0;
        canvasAnnot.style.bottom = 0;
        canvasAnnot.style.right = 0;

        element.appendChild(canvasAnnot);
        */

        var el = {
            element: element,
            renderer: renderer,
            canvas: canvas,
            //canvasAnnot: canvasAnnot,
            image : undefined, // will be set once image is loaded
            invalid: false, // true if image needs to be drawn, false if not
            data : {}
        };
        cornerstone.addEnabledElement(el);

        return element;
    }

    // module/private exports
    cornerstone.enable = enable;
}(cornerstone));