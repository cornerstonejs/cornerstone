import triggerEvent from '../triggerEvent.js';
import EVENTS from '../events.js';
import drawImageSync from './drawImageSync.js';
import requestAnimationFrame from './requestAnimationFrame.js';
import { getEnabledElement } from '../enabledElements.js';

let rafId = null;
let rafStopTime = null;
const map = new Map();


/**
 * Internal API function to draw an image to a given enabled element
 *
 * @param {EnabledElement} enabledElement The Cornerstone Enabled Element to redraw
 * @param {Boolean} [invalidated = false] - true if pixel data has been invalidated and cached rendering should not be used
 * @returns {void}
 * @memberof Internal
 */
export function drawImage (enabledElement, invalidated = false) {
  registerVisibilityChange();

  if (!enabledElement || !enabledElement.canvas || (!enabledElement.image && enabledElement.layers.length < 1)) {
    return;
  }
  
  const element = enabledElement.element;
  
  if (invalidated) {
    enabledElement.invalid = true;
  }

  if (!map.has(element)) {
    map.set(element, { 
      needsRedraw: false, 
      callbacks: new Set()
    });
  }

  map.get(element).needsRedraw = true;

  rafStopTime = performance.now() + 100;
  if (!rafId) {
    rafId = requestAnimationFrame(step);
  }
}

function step () {
  map.forEach((entry, element) => {
    if (!element || !entry || !entry.needsRedraw) {
      return;
    }
    
    const hasCallbacks = entry.callbacks.size > 0;
    
    entry.needsRedraw = hasCallbacks;

    let enabledElement;

    try { 
      enabledElement = getEnabledElement(element); 
    } catch (err) { 
      return; 
    }
    
    const eventDetails = {
      enabledElement,
      timestamp: Date.now()
    };
    
    triggerEvent(element, EVENTS.PRE_RENDER, eventDetails);
    
    drawImageSync(enabledElement, enabledElement.invalid);

    if (hasCallbacks) {
      entry.callbacks.forEach((rafcb) => {
        try {
          rafcb(enabledElement);
        } catch (err) {
          // swallow
        }
      });
      rafStopTime = performance.now() + 100; 
    }
  });
  
  if (rafStopTime && performance.now() < rafStopTime) {
    rafId = requestAnimationFrame(step);
  } else {
    stopRaf();
  }
}


/**
 * add a callback to be called on every RequestAnimationFrame step
 *
 * @param {HTMLElement} element The Cornerstone element for this callback
 * @param {Function} f The callback to call, will be called with the enabled cornerstone element
 * @returns {void}
 * @memberof Internal
 */
export function addDrawCallback (element, f) {
  if (!element) {
    return;
  }
  if (!map.has(element)) {
    map.set(element, { 
      needsRedraw: false, 
      callbacks: new Set()
    });
  }

  map.get(element).callbacks.add(f);
}


/**
 * remove a callback that was added with addDrawCallback
 *
 * @param {HTMLElement} element The Cornerstone element for this callback
 * @param {Function} f The callback to delete
 * @returns {void}
 * @memberof Internal
 */
export function removeDrawCallback (element, f) {
  if (!element) {
    return;
  }
  const entry = map.get(element);
  
  if (!entry) {
    return;
  }
  entry.callbacks.delete(f);
}


function registerVisibilityChange () {
  if (registerVisibilityChange.registered) {
    return;
  }
  registerVisibilityChange.registered = true;

  // Set the name of the hidden property and the change event for visibility
  let hidden, visibilityChange; 

  if (typeof document.hidden !== 'undefined') { // Opera 12.10 and Firefox 18 and later support 
    hidden = 'hidden';
    visibilityChange = 'visibilitychange';
  } else if (typeof document.msHidden !== 'undefined') {
    hidden = 'msHidden';
    visibilityChange = 'msvisibilitychange';
  } else if (typeof document.webkitHidden !== 'undefined') {
    hidden = 'webkitHidden';
    visibilityChange = 'webkitvisibilitychange';
  }  

  if (!hidden || !visibilityChange) {
    return;
  }
  
  document.addEventListener(visibilityChange, () => {
    stopRaf();
  
    if (!document[hidden]) {
      rafStopTime = performance.now() + 100;
      console.log('raf started');
      rafId = requestAnimationFrame(step);
    }
  }, false);
}


function stopRaf () {
  if (rafId) {
    try { 
      cancelAnimationFrame(rafId); 
    } catch (err) {
      // swallow
    }
  }
  
  rafId = null;
}
