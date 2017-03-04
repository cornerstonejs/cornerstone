/**
 * This module is responsible for enabling an element to display images with cornerstone
 */

import { addEnabledElement } from './enabledElements.js';
import { resize } from './resize.js';
import { requestAnimationFrame } from './internal/requestAnimationFrame.js';

export function enable(element) {
    if(element === undefined) {
        throw "enable: parameter element cannot be undefined";
    }

    var canvas = document.createElement('canvas');
    element.appendChild(canvas);

    var el = {
        element: element,
        canvas: canvas,
        image : undefined, // will be set once image is loaded
        invalid: false, // true if image needs to be drawn, false if not
        needsRedraw:true,
        data : {}
    };
    addEnabledElement(el);

    resize(element, true);


    function draw() {
        if (el.canvas === undefined){
            return;
        }
        if (el.needsRedraw && el.image !== undefined){
            var start = new Date();
            el.image.render(el, el.invalid);

            var context = el.canvas.getContext('2d');

            var end = new Date();
            var diff = end - start;

            var eventData = {
                viewport: el.viewport,
                element: el.element,
                image: el.image,
                enabledElement: el,
                canvasContext: context,
                renderTimeInMs: diff
            };

            var event = new CustomEvent("CornerstoneImageRendered", {detail: eventData});
            el.element.dispatchEvent(event);
            el.invalid = false;
            el.needsRedraw = false;
        }

        requestAnimationFrame(draw);
    }

    draw();

    return element;
}
