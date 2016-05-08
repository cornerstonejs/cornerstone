/**
 */
(function (cornerstone) {

  "use strict";

  /**
   * Resets the viewport to the default settings
   *
   * @param element
   */
  function reset(element)
  {
    var enabledElement = cornerstone.getEnabledElement(element);

    enabledElement.viewport = 
      enabledElement.initialViewport || cornerstone.internal.getDefaultViewport(enabledElement.image);

    cornerstone.updateImage(element);
  }

  cornerstone.reset = reset;
}(cornerstone));
