import { getEnabledElement } from './enabledElements.js';

export function getElementData (el, dataType) {
  const ee = getEnabledElement(el);

  if (ee.data.hasOwnProperty(dataType) === false) {
    ee.data[dataType] = {};
  }

  return ee.data[dataType];
}

export function removeElementData (el, dataType) {
  const ee = getEnabledElement(el);

  delete ee.data[dataType];
}
