import { external } from './externalModules.js';

/**
 * Trigger a CustomEvent
 *
 * @param {EventTarget} el The element or EventTarget to trigger the event upon
 * @param {String} type The event type name
 * @param {Object|null} detail=null The event data to be sent
 * @returns {void}
 */
export default function triggerEvent (el, type, detail = null) {
  const event = new CustomEvent(type.toLocaleLowerCase(), { detail });

  // TODO: remove jQuery event triggers
  external.$(el).trigger(type, detail);
  el.dispatchEvent(event);
}
