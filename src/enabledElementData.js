import { getEnabledElement } from './enabledElements.js';

/**
 * Retrieves any data for a Cornerstone enabledElement for a specific string
 * dataType
 *
 * @param {HTMLElement} element An HTML Element enabled for Cornerstone
 * @param {string} dataType A string name for an arbitrary set of data
 * @returns {*} Whatever data is stored for this enabled element
 */
export function getElementData (element, dataType) {
  const ee = getEnabledElement(element);

  if (ee.data.hasOwnProperty(dataType) === false) {
    ee.data[dataType] = {};
  }

  return ee.data[dataType];
}

/**
 * Clears any data for a Cornerstone enabledElement for a specific string
 * dataType
 *
 * @param {HTMLElement} element An HTML Element enabled for Cornerstone
 * @param {string} dataType A string name for an arbitrary set of data
 *
 * @returns {void}
 */
export function removeElementData (element, dataType) {
  const ee = getEnabledElement(element);

  delete ee.data[dataType];
}
