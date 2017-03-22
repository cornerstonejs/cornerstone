/**
 * This module deals with ImageLoaders, loading images and caching images
 */

(function (cornerstone) {

    "use strict";

    var eventTypes = {};

    // Registers an event listener
    function addEventListener(type, callback) {
        var eventListeners = eventTypes[type] || [];
        eventListeners.push(callback);
        eventTypes[type] = eventListeners;
    }

    // Dispatches an event
    function dispatchEvent(event) {
        var eventListeners = eventTypes[event.type];

        if (!eventListeners || eventListeners.length < 1) {
            return;
        }

        for (var i = 0; i < eventListeners.length; i++) {
            eventListeners[i](event);
        }
    }

    // module exports
    cornerstone.addEventListener = addEventListener;
    cornerstone.dispatchEvent = dispatchEvent;

}(cornerstone));
