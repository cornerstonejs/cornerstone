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
     * Adjusts an images scale and center so the image is centered and completely visible
     * @param element
     */
    function fitToWindow(element)
    {
        var enabledElement = cornerstone.getEnabledElement(element);

        var imageSize = getImageSize(enabledElement);
        var elStyle = window.getComputedStyle(element);
        enabledElement.viewport.scale = cornerstone.internal.scaleToFit(
            parseInt(elStyle.width), parseInt(elStyle.height), // element size
            imageSize.width,         imageSize.height);        // image size

        enabledElement.viewport.translation.x = 0;
        enabledElement.viewport.translation.y = 0;
        cornerstone.internal.applyTransform(enabledElement);
    }

    cornerstone.fitToWindow = fitToWindow;
}(cornerstone));
