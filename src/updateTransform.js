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
            image = enabledElement.image,
            
            transform = 'translate(' + 
                (viewport.translation.x === 0 ? '-50%,' : 'calc(' + viewport.translation.x + 'px - 50%),') +
                (viewport.translation.y === 0 ? '-50%)' : 'calc(' + viewport.translation.y + 'px - 50%))');

        //We dont need to translate to center to apply scale/rotation thanks to transform-origin
        
        if( viewport.rotation%360 !== 0 )//heavy test for small optimisation ?
            transform += 'rotate(' + viewport.rotation + 'deg)'; //use radiant ?

        //use rotation for flip so we can animate it
        transform += 'rotateY(' + (viewport.hflip ? 180 : 0) + 'deg)';
        transform += 'rotateX(' + (viewport.vflip ? 180 : 0) + 'deg)';

        //scale
        var widthScale = enabledElement.viewport.scale;
        var heightScale = enabledElement.viewport.scale;
       if(image){
            if(image.rowPixelSpacing < image.columnPixelSpacing)
                widthScale = widthScale * (image.columnPixelSpacing / image.rowPixelSpacing);
            else if(image.columnPixelSpacing < image.rowPixelSpacing)
                heightScale = heightScale * (image.rowPixelSpacing / image.columnPixelSpacing);
        }

        transform += 'scale(' + widthScale + ',' + heightScale +')';

        enabledElement.canvas.style.transform = transform;

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
