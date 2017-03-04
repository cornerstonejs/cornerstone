import { getDefaultViewport } from './internal/getDefaultViewport.js';
import { getEnabledElement } from './enabledElements.js';
import { updateImage } from './updateImage.js';

/**
 * Resets the viewport to the default settings
 *
 * @param element
 */
export function reset(element)
{
  var enabledElement = getEnabledElement(element);
  var defaultViewport = getDefaultViewport(enabledElement.canvas, enabledElement.image);
  enabledElement.viewport = defaultViewport;
  updateImage(element);
}
