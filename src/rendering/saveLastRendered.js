/**
 * Saves the parameters of the last render into renderingTools, used later to decide if data can be reused.
 *
 * @param {Object} enabledElement Cornerstone EnabledElement
 * @returns {Object} enabledElement.renderingTools
 * @memberof rendering
 */

export default function (enabledElement) {
  const imageId = enabledElement.image.imageId;
  const viewport = enabledElement.viewport;
  const isColor = enabledElement.image.color;

  enabledElement.renderingTools.lastRenderedImageId = imageId;
  enabledElement.renderingTools.lastRenderedIsColor = isColor;
  enabledElement.renderingTools.lastRenderedViewport = {
    windowCenter: viewport.voi.windowCenter,
    windowWidth: viewport.voi.windowWidth,
    invert: viewport.invert,
    rotation: viewport.rotation,
    hflip: viewport.hflip,
    vflip: viewport.vflip,
    modalityLUT: viewport.modalityLUT,
    voiLUT: viewport.voiLUT,
    colormap: viewport.colormap
  };

  return enabledElement.renderingTools;
}
