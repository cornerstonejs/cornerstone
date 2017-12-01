export default function (enabledElement, image) {
  console.log('initializeRenderCanvas');
  const renderCanvas = enabledElement.renderingTools.renderCanvas;

  // Resize the canvas
  renderCanvas.width = image.width;
  renderCanvas.height = image.height;

  const canvasContext = renderCanvas.getContext('2d');

  // NOTE - we need to fill the render canvas with white pixels since we
  // control the luminance using the alpha channel to improve rendering performance.
  canvasContext.fillStyle = 'white';
  canvasContext.fillRect(0, 0, renderCanvas.width, renderCanvas.height);

  const renderCanvasData = canvasContext.getImageData(0, 0, image.width, image.height);

  enabledElement.renderingTools.renderCanvasContext = canvasContext;
  enabledElement.renderingTools.renderCanvasData = renderCanvasData;
}
