/**
 * This module will fit an image to fit inside the canvas displaying it such that all pixels
 * in the image are viewable
 */
(function (cornerstone) {

    "use strict";

    function getImageSize(enabledElement) {
      if(enabledElement.viewport.rotation === 0 ||enabledElement.viewport.rotation === 180) {
        return {
          width: enabledElement.image.width,
          height: enabledElement.image.height
        };
      } else {
        return {
          width: enabledElement.image.height,
          height: enabledElement.image.width
        };
      }
    }

    /**
     * Deprecated
     * Adjusts an images scale and center so the image is centered and completely visible
     * @param element
     * @param [Number] elWidth  element width in px unit
     * @param [Number] elHeight element height in px unit
     */
    function fitToWindow(element, elwidth, elHeight)
    {
        var enabledElement = cornerstone.getEnabledElement(element);

        var imageSize = getImageSize(enabledElement);

        enabledElement.viewport.scale = _scaleToFit(
            elwidth,          elHeight, // element size
            imageSize.width,  imageSize.height);        // image size

        enabledElement.viewport.translation.x = 0;
        enabledElement.viewport.translation.y = 0;
        cornerstone.internal.applyTransform(enabledElement);
    }

    function _scaleToFit(elWidth, elHeight, imgWidth, imgHeight){
        return Math.min(elWidth / imgWidth, elHeight / imgHeight);
    }

    function scaleToFit(elWidth, elHeight, image){
        return _scaleToFit(elWidth, elHeight, image.columns, image.rows);
    }

    
    cornerstone.fitToWindow = fitToWindow;
    cornerstone.scaleToFit = scaleToFit;

}(cornerstone));
