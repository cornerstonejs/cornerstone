export default function triggerEvent (el, type, detail) {
  let event;

  type = type.toLocaleLowerCase();

  detail = detail || {};

  if (window.CustomEvent) {
    event = new CustomEvent(type, { detail });
  } else {
    event = document.createEvent('CustomEvent');
    event.initCustomEvent(type, true, true, detail);
  }

  if (el.dispatchEvent) {
    el.dispatchEvent(event);
  } else {
    document.dispatchEvent(event);
  }
}

