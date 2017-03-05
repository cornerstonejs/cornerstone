/**
 * This module is responsible for drawing invalidated enabled elements
 */

import { getEnabledElements } from './enabledElements.js';
import { drawImage } from './internal/drawImage.js';

/**
 * Draws all invalidated enabled elements and clears the invalid flag after drawing it
 */
export function drawInvalidated()
{
    var enabledElements = getEnabledElements();
    for(var i=0;i < enabledElements.length; i++) {
        var ee = enabledElements[i];
        if(ee.invalid === true) {
            drawImage(ee, true);
        }
    }
}
