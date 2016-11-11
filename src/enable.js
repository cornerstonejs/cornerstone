/**
 * This module is responsible for enabling an element to display images with cornerstone
 */
(function (cornerstone) {

    "use strict";

    function enable(element, options) {
        if(element === undefined) {
            throw "enable: parameter element cannot be undefined";
        }

        // If this enabled element has the option set for WebGL, we should
        // check if this device actually supports it
        if (options && options.renderer && options.renderer.toLowerCase() === 'webgl') {
            if (cornerstone.webGL.renderer.isWebGLAvailable()) {
                // If WebGL is available on the device, initialize the renderer
                // and return the renderCanvas from the WebGL rendering path
                console.log('Using WebGL rendering path');
                
                cornerstone.webGL.renderer.initRenderer();
                options.renderer = 'webgl';
            } else {
                // If WebGL is not available on this device, we will fall back
                // to using the Canvas renderer
                console.error('WebGL not available, falling back to Canvas renderer');
                delete options.renderer;
            }
        }

        var canvas = document.createElement('canvas');
        element.appendChild(canvas);

        var el = {
            element: element,
            canvas: canvas,
            image : undefined, // will be set once image is loaded
            invalid: false, // true if image needs to be drawn, false if not
            needsRedraw:true,
            options: options,
            data : {}
        };
        cornerstone.addEnabledElement(el);

        cornerstone.resize(element, true);


        function draw() {
            if (el.canvas === undefined){
                return;
            }
            if (el.needsRedraw && el.image !== undefined){
                var start = new Date();
                el.image.render(el, el.invalid);

                var context = el.canvas.getContext('2d');

                var end = new Date();
                var diff = end - start;

                var eventData = {
                    viewport: el.viewport,
                    element: el.element,
                    image: el.image,
                    enabledElement: el,
                    canvasContext: context,
                    renderTimeInMs: diff
                };

                el.invalid = false;
                el.needsRedraw = false;
                $(el.element).trigger("CornerstoneImageRendered", eventData);
            }

            cornerstone.requestAnimationFrame(draw);
        }

        draw();

        return element;
    }

    // module/private exports
    cornerstone.enable = enable;
}(cornerstone));
