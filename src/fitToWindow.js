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

        var verticalScale = enabledElement.canvas.height / imageSize.height;
        var horizontalScale= enabledElement.canvas.width / imageSize.width;
        if(horizontalScale < verticalScale) {
          enabledElement.viewport.scale = horizontalScale;
        }
        else
        {
          enabledElement.viewport.scale = verticalScale;
        }
        enabledElement.viewport.translation.x = 0;
        enabledElement.viewport.translation.y = 0;
        cornerstone.updateImage(element);
    }

    cornerstone.fitToWindow = fitToWindow;
}(cornerstone));
