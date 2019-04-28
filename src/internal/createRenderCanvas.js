/**
 * Constructor for renderCanvas objects, defaults to Canvas DOM element if no custom constructor is provided.
 * Useful if you need to render to custom canvas implementations, like react-native-canvas or node-canvas.
 * @param {Object} options Options for the enabledElement
 * @return {HTMLElement} canvas A Canvas DOM element implementation
 */
export default function createRenderCanvas (options) {
  return (options.rendering && options.rendering.createRenderCanvas && options.rendering.options.createRenderCanvas()) ||
   document.createElement('canvas');
}
