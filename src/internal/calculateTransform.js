import { Transform } from './transform.js';

export function calculateTransform(enabledElement, scale) {

    var transform = new Transform();
    transform.translate(enabledElement.canvas.width/2, enabledElement.canvas.height / 2);

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

    if(scale !== undefined) {
        // apply the font scale
        transform.scale(scale, scale);
    }

    //Apply Flip if required
    if(enabledElement.viewport.hflip) {
        transform.scale(-1,1);
    }

    if(enabledElement.viewport.vflip) {
        transform.scale(1,-1);
    }

    // translate the origin back to the corner of the image so the event handlers can draw in image coordinate system
    transform.translate(-enabledElement.image.width / 2 , -enabledElement.image.height/ 2);
    return transform;
}
