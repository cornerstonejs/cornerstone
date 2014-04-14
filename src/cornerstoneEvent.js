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

    function cornerstoneEvent(enabledElement, eventName) {
        var event;
        if(ieVersion <= 11) {
            event = new CustomEventIe(
                eventName,
                {
                    detail: {
                        viewport: enabledElement.viewport,
                        element: enabledElement.element,
                        image: enabledElement.image
                    },
                    bubbles: false,
                    cancelable: false
                }
            );
        } else {
            event = new CustomEvent(
                eventName,
                {
                    detail: {
                        viewport: enabledElement.viewport,
                        element: enabledElement.element,
                        image: enabledElement.image

                    },
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