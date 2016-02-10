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
    var defaultViewport = cornerstone.internal.getDefaultViewport(enabledElement, enabledElement.image);
    enabledElement.viewport = defaultViewport;
    cornerstone.updateImage(element);
  }

  cornerstone.reset = reset;
}(cornerstone));
