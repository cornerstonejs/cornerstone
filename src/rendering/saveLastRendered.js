export default function (enabledElement) {
  const imageId = enabledElement.image.imageId;
  const viewport = enabledElement.viewport;

  enabledElement.renderingTools.lastRenderedImageId = imageId;
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
