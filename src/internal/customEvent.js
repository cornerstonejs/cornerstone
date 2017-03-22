/**
 * This module polyfills the CustomEvent() constructor for IE support
 * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent
 */
(function (cornerstone) {

    "use strict";

    var CustomEventCompliant = window.CustomEvent;

    if ( typeof CustomEventCompliant !== "function" ) {
      CustomEventCompliant = function CustomEvent(event, params) {
          params = params || { bubbles: false, cancelable: false, detail: undefined };
          var evt = document.createEvent('CustomEvent');
          evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
          return evt;
      }
      CustomEventCompliant.prototype = window.Event.prototype;
    }

    // Module exports
    cornerstone.internal.CustomEvent = CustomEventCompliant;

}(cornerstone));
