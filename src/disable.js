import { getEnabledElements } from './enabledElements.js';

/**
 *  Disable an HTML element for further use in Cornerstone
 *
 * @param {HTMLElement} element An HTML Element enabled for Cornerstone
 * @returns {void}
 */
export default function (element) {
  if (element === undefined) {
    throw new Error('disable: element must not be undefined');
  }

  // Search for this element in this list of enabled elements
  const enabledElements = getEnabledElements();

  for (let i = 0; i < enabledElements.length; i++) {
    if (enabledElements[i].element === element) {
      // We found it!

      // Fire an event so dependencies can cleanup
      const eventData = {
        element
      };

      $(element).trigger('CornerstoneElementDisabled', eventData);

      // Remove the child DOM elements that we created (e.g.canvas)
      enabledElements[i].element.removeChild(enabledElements[i].canvas);
      enabledElements[i].canvas = undefined;

      // Remove this element from the list of enabled elements
      enabledElements.splice(i, 1);

      break;
    }
  }
}
