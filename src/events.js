export const EVENTS = {
  NEW_IMAGE: 'cornerstonenewimage',
  INVALIDATED: 'cornerstoneinvalidated',
  PRE_RENDER: 'cornerstoneprerender',
  IMAGE_CACHE_MAXIMUM_SIZE_CHANGED: 'cornerstoneimagecachemaximumsizechanged',
  IMAGE_CACHE_PROMISE_REMOVED: 'cornerstoneimagecachepromiseremoved',
  IMAGE_CACHE_FULL: 'cornerstoneimagecachefull',
  IMAGE_CACHE_CHANGED: 'cornerstoneimagecachechanged',
  WEBGL_TEXTURE_REMOVED: 'cornerstonewebgltextureremoved',
  WEBGL_TEXTURE_CACHE_FULL: 'cornerstonewebgltexturecachefull',
  IMAGE_LOADED: 'cornerstoneimageloaded',
  IMAGE_LOAD_FAILED: 'cornerstoneimageloadfailed',
  ELEMENT_RESIZED: 'cornerstoneelementresized',
  IMAGE_RENDERED: 'cornerstoneimagerendered',
  LAYER_ADDED: 'cornerstonelayeradded',
  LAYER_REMOVED: 'cornerstonelayerremoved',
  ACTIVE_LAYER_CHANGED: 'cornerstoneactivelayerchanged',
  ELEMENT_DISABLED: 'cornerstoneelementdisabled'
};

/**
 * EventTarget - Provides the [EventTarget](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget) interface
 *
 * @class
 * @memberof Polyfills
 */
class EventTarget {
  constructor () {
    this.listeners = {};
  }

  addEventListener (type, callback) {
    if (!(type in this.listeners)) {
      this.listeners[type] = [];
    }

    this.listeners[type].push(callback);
  }

  removeEventListener (type, callback) {
    if (!(type in this.listeners)) {
      return;
    }

    const stack = this.listeners[type];

    for (let i = 0, l = stack.length; i < l; i++) {
      if (stack[i] === callback) {
        stack.splice(i, 1);

        return;
      }
    }
  }

  dispatchEvent (event) {
    if (!(event.type in this.listeners)) {
      return true;
    }

    const stack = this.listeners[event.type];

    for (let i = 0, l = stack.length; i < l; i++) {
      stack[i].call(this, event);
    }

    return !event.defaultPrevented;
  }
}


const events = new EventTarget();

export default events;
