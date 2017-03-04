/**
 * This module deals with ImageLoaders, loading images and caching images
 */

var eventTypes = {};

// Registers an event listener
export function addEventListener(type, callback) {
  console.log("REGISTER", type, callback);
    var eventListeners = eventTypes[type] || [];
    eventListeners.push(callback);
    eventTypes[type] = eventListeners;
}

// Dispatches an event
export function dispatchEvent(type, data) {
  console.log("DISPATCH", type, data);
    var eventListeners = eventTypes[type];

    if (!eventListeners || eventListeners.length < 1) {
        return;
    }

    for (var i = 0; i < eventListeners.length; i++) {
        eventListeners[i](data);
    }
}
