/**
 * This module contains functions to deal with getting and setting the viewport for an enabled element
 */
(function (cornerstone) {

    "use strict";

    /**
     * Sets the viewport for an element and corrects invalid values
     *
     * @param element - DOM element of the enabled element
     * @param viewport - Object containing the viewport properties
     * @returns {*}
     */
    function setViewport(element, viewport) {

        var enabledElement = cornerstone.getEnabledElement(element),
            elViewport = enabledElement.viewport;

        //TODO should take into consideration the 3 borning condition below (rotation, windowWidth, scale)
        var needViewportUpdate = elViewport.scale != viewport.scale ||
                                 elViewport.translation.x != viewport.translation.x ||
                                 elViewport.translation.y != viewport.translation.y ||
                                 elViewport.rotation != viewport.rotation ||
                                 elViewport.hflip != viewport.hflip ||
                                 elViewport.vflip != viewport.vflip;  

        var needImageUpdate =   elViewport.voi.windowWidth != viewport.voi.windowWidth ||
                                elViewport.voi.windowCenter != viewport.voi.windowCenter ||
                                elViewport.invert != viewport.invert ||
                                elViewport.modalityLUT != viewport.modalityLUT ||
                                elViewport.voiLUT != viewport.voiLUT;

        elViewport.scale = viewport.scale;
        elViewport.translation.x = viewport.translation.x;
        elViewport.translation.y = viewport.translation.y;
        elViewport.voi.windowWidth = viewport.voi.windowWidth;
        elViewport.voi.windowCenter = viewport.voi.windowCenter;
        elViewport.invert = viewport.invert;
        elViewport.pixelReplication = viewport.pixelReplication;
        elViewport.rotation = viewport.rotation % 360;
        elViewport.hflip = viewport.hflip;
        elViewport.vflip = viewport.vflip;
        elViewport.modalityLUT = viewport.modalityLUT;
        elViewport.voiLUT = viewport.voiLUT;

        // prevent window width from being too small (note that values close to zero are valid and can occur with
        // PET images in particular)
        if(elViewport.voi.windowWidth < 0.000001)
            elViewport.voi.windowWidth = 0.000001;

        // prevent scale from getting too small
        if(elViewport.scale < 0.0001)
            elViewport.scale = 0.25;

        if(needViewportUpdate)
            cornerstone.applyTransform(enabledElement);

        if(needImageUpdate){
            element.style.background = elViewport.invert ? '#fff' : '#000';
            cornerstone.drawImage(enabledElement, true);
        }
    }


    // module/private exports
    cornerstone.setViewport = setViewport;

}(cornerstone));
