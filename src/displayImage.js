import { getEnabledElement } from './enabledElements.js';
import getDefaultViewport from './internal/getDefaultViewport.js';
import updateImage from './updateImage.js';
import now from './internal/now.js';

/**
 * Sets a new image object for a given element.
 *
 * Will also apply an optional viewport setting.
 *
 * @param {HTMLElement} element An HTML Element enabled for Cornerstone
 * @param {Object} image An Image loaded by a Cornerstone Image Loader
 * @param {Object} [viewport] A set of Cornerstone viewport parameters
 * @returns {void}
 */
export default function (element, image, viewport) {
  if (element === undefined) {
    throw new Error('displayImage: parameter element must not be undefined');
  }
  if (image === undefined) {
    throw new Error('displayImage: parameter image must not be undefined');
  }

  const enabledElement = getEnabledElement(element);
  const oldImage = enabledElement.image;

  enabledElement.image = image;

  if (enabledElement.viewport === undefined) {
    enabledElement.viewport = getDefaultViewport(enabledElement.canvas, image);
  }

    // Merge viewport
  if (viewport) {
    for (const attrname in viewport) {
      if (viewport[attrname] !== null) {
        enabledElement.viewport[attrname] = viewport[attrname];
      }
    }
  }

  let frameRate;

  if (enabledElement.lastImageTimeStamp !== undefined) {
    const timeSinceLastImage = now() - enabledElement.lastImageTimeStamp;

    frameRate = (1000 / timeSinceLastImage).toFixed();
  }

  enabledElement.lastImageTimeStamp = now();

  const newImageEventData = {
    viewport: enabledElement.viewport,
    element: enabledElement.element,
    image: enabledElement.image,
    oldImage,
    enabledElement,
    frameRate
  };

  $(enabledElement.element).trigger('CornerstoneNewImage', newImageEventData);

  updateImage(element);
}
