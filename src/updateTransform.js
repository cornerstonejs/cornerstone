(function (cornerstone) {

    "use strict";

    /**
     * Forces the transform to be updated for the specified enabled element
     * @param element
     */
    function updateTransform(element) {
        var enabledElement = cornerstone.getEnabledElement(element);
        if(enabledElement.image === undefined) {
            throw "updateTransform: image has not been loaded yet";
        }
       
       applyTransform(enabledElement);
    }

    function applyTransform(enabledElement){      

        var viewport = enabledElement.viewport,
            transform = 'translate(' + 
                (viewport.translation.x === 0 ? '-50%,' : 'calc(' + viewport.translation.x + 'px - 50%),') +
                (viewport.translation.y === 0 ? '-50%)' : 'calc(' + viewport.translation.y + 'px - 50%))');

        //We dont need to translate to center to apply scale/rotation thanks to transform-origin
        
        if( viewport.rotation%360 !== 0 )//heavy test for small optimisation ?
            transform += 'rotate(' + viewport.rotation + 'deg)'; //use radiant ?

        //use rotation for flip so we can animate it
        if(viewport.hflip)
            transform += 'rotateY(180deg)';
        if(viewport.vflip)
            transform += 'rotateX(180deg)';

        //no need for an if() because we will likely always have a scale
        transform += 'scale(' + viewport.scale + ')';

        /* flip with scale()
        transform += 'scale('+ 
            (viewport.hflip? -1 : 1)*viewport.scale + //x
            ',' + 
            (viewport.vflip? -1 : 1)*viewport.scale + //y
            ')';
        */

        enabledElement.renderer.style.transform = transform;

        $(enabledElement.element).trigger("CornerstoneTransformUpdated", {
            viewport : enabledElement.viewport,
            element : enabledElement.element,
            image : enabledElement.image,
            enabledElement : enabledElement,
            canvasContext: enabledElement.canvas.getContext('2d')
        });
    }

    // module exports
    cornerstone.updateTransform = updateTransform;
    cornerstone.internal.applyTransform = applyTransform;

}(cornerstone));