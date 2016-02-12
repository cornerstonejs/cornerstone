/**
 * This module contains a function to immediately redraw an image
 */
(function (cornerstone) {

    "use strict";

    var pendingEls = {},
        pool = [],
        loopRunning = false;

    function renderingLoop(){
        var id = pool.shift(),
            el = pendingEls[id];

        delete pendingEls[id];
        cornerstone.drawImage(el.enabledElement, el.invalidated);
        el.promise.resolve();

        //if we have still pending rendering continue otherwise stop
        if(pool.length > 0)
            window.requestAnimationFrame(renderingLoop);
        else
            loopRunning = false;
    }

    /**
     * Update the image display by adding it to the rendering pool
     * 
     * @param element
     */
    function updateImage(element, invalidated) {
        var enabledElement = cornerstone.getEnabledElement(element);

        if(enabledElement.image === undefined) {
            throw "updateImage: image has not been loaded yet";
        }

        var id = enabledElement.id,
            pendingElement = pendingEls[id];
        //if this element is not yet on the pool add it
        //otherwise do nothing cause it means we're asking for an update before the previous one had time to complete
        if( !pendingElement ){
            pendingEls[id] = pendingElement = { 
                enabledElement: enabledElement,
                promise: $.Deferred()
            };
            pool.push(id);

            //start loop if is not already running
            if( !loopRunning ){
                loopRunning = true;
                window.requestAnimationFrame(renderingLoop);
            }
        }

        //if we have at least one call to updateImage() with invalidated set to true
        //invalidated must be set to true for the rendering
        if(invalidated)
            pendingElement.invalidated = true;

       return pendingElement.promise;
    }

    // module exports
    cornerstone.updateImage = updateImage;

}(cornerstone));
