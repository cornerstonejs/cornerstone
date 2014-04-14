/**
 * This module handles event dispatching
 */
var cornerstone = (function (cornerstone) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
    }

    var ieVersion = cornerstone.ieVersion();

    function CustomEventIe ( event, params ) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent( 'CustomEvent' );
        evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
        return evt;
    }

    CustomEventIe.prototype = window.Event.prototype;

    function cornerstoneEvent(enabledElement, eventName, obj) {
        if(obj === undefined) {
            obj = {};
        }

        obj.viewport = enabledElement.viewport;
        obj.element = enabledElement.element;
        obj.image = enabledElement.image;
        obj.enabledElement = enabledElement;

        var event;
        if(ieVersion <= 11) {
            event = new CustomEventIe(
                eventName,
                {
                    detail: obj,
                    bubbles: false,
                    cancelable: false
                }
            );
        } else {
            event = new CustomEvent(
                eventName,
                {
                    detail: obj,
                    bubbles: false,
                    cancelable: false
                }
            );
        }
        enabledElement.element.dispatchEvent(event);
    }

    // module/private exports
    cornerstone.event = cornerstoneEvent;

    return cornerstone;
}(cornerstone));