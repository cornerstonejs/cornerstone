
(function (cornerstone) {

    "use strict";

    function calculateTransform(enabledElement, scale) {

        var transform = new cornerstone.internal.Transform();
        transform.translate(-enabledElement.canvas.width/2, -enabledElement.canvas.height / 2);

        //Apply the rotation before scaling for non square pixels
        var angle = enabledElement.viewport.rotation;
        if(angle!==0) {
            transform.rotate(angle*Math.PI/180);
        }

        // apply the scale
        var widthScale = enabledElement.viewport.scale;
        var heightScale = enabledElement.viewport.scale;
        if(enabledElement.image.rowPixelSpacing < enabledElement.image.columnPixelSpacing) {
            widthScale = widthScale * (enabledElement.image.columnPixelSpacing / enabledElement.image.rowPixelSpacing);
        }
        else if(enabledElement.image.columnPixelSpacing < enabledElement.image.rowPixelSpacing) {
            heightScale = heightScale * (enabledElement.image.rowPixelSpacing / enabledElement.image.columnPixelSpacing);
        }
        transform.scale(widthScale, heightScale);

        // unrotate to so we can translate unrotated
        if(angle!==0) {
            transform.rotate(-angle*Math.PI/180);
        }

        // apply the pan offset
        transform.translate(enabledElement.viewport.translation.x, enabledElement.viewport.translation.y);

        // rotate again so we can apply general scale
        if(angle!==0) {
            transform.rotate(angle*Math.PI/180);
        }

        scale = scale || 1;
        matrix.scale( (viewport.hflip ? -1 : 1)*scale, (viewport.vflip ? -1 : 1)*scale );

        // translate the origin back to the corner of the image so the event handlers can draw in image coordinate system
        //transform.translate(-enabledElement.image.width / 2 , -enabledElement.image.height/ 2);
        return transform;
    }

    // Module exports
    cornerstone.internal.calculateTransform = calculateTransform;
}(cornerstone));