const CANVAS_CSS_CLASS = 'cornerstone-canvas';

/**
 * Create a canvas and append it to the element
 *
 * @param {HTMLElement} element An HTML Element
 * @return {HTMLElement} canvas A Canvas DOM element
 */
function createCanvas (element) {
  const canvas = document.createElement('canvas');

  canvas.style.display = 'block';
  canvas.classList.add(CANVAS_CSS_CLASS);
  element.appendChild(canvas);

  return canvas;
}

/**
 * Create a canvas or returns the one that already exists for a given element
 *
 * @param {HTMLElement} element An HTML Element
 * @return {HTMLElement} canvas A Canvas DOM element
 */
export default function getCanvas (element) {
  const selector = `canvas.${CANVAS_CSS_CLASS}`;

  return element.querySelector(selector) || createCanvas(element);
}
