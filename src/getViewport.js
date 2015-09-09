/**
 * This module contains functions to deal with getting and setting the viewport for an enabled element
 */
(function (cornerstone) {

    "use strict";

    /**
     * Returns the viewport for the specified enabled element
     * @param element
     * @returns {*}
     */
    function getViewport(element) {
        var enabledElement = cornerstone.getEnabledElement(element);

        var viewport = enabledElement.viewport;
        if(viewport === undefined) {
            return undefined;
        }
        return {
            scale : viewport.scale,
            translation : {
                x : viewport.translation.x,
                y : viewport.translation.y
            },
            voi : {
                windowWidth: viewport.voi.windowWidth,
                windowCenter : viewport.voi.windowCenter
            },
            invert : viewport.invert,
            pixelReplication: viewport.pixelReplication,
            rotation: viewport.rotation, 
            hflip: viewport.hflip,
            vflip: viewport.vflip,
            modalityLUT: viewport.modalityLUT,
            voiLUT: viewport.voiLUT
        };
    }

    // module/private exports
    cornerstone.getViewport = getViewport;

}(cornerstone));
