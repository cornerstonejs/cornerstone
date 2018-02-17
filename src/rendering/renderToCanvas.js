import { getEnabledElements } from '../enabledElements.js';
import displayImage from '../displayImage.js';
import enableElement from '../enable.js';

export default function (canvas, imageID, viewport) {
  if (canvas === undefined) {
    throw new Error('renderToCanvas: parameter canvas cannot be undefined');
  }

  const enabledElements = getEnabledElements();
  const elements = [];

  enabledElements.forEach(function (enabledElement) {
    if (enabledElement.canvas && enabledElement.canvas === canvas) {
      elements.push(enabledElement.element);
    }
  });

  if (elements.length === 0) {
    enableElement(canvas, null, canvas);
    elements.push(canvas);
  }

  elements.forEach(function (element) {
    displayImage(element, imageID, viewport);
  });
}
