---
description: Viewport (e.g. windowing, pan, zoom) changes for Cornerstone Enabled Elements are updated through a rendering loop based on requestAnimationFrame.
---

# Rendering Loop

> Viewport (e.g. windowing, pan, zoom, etc...) changes for Cornerstone Enabled Elements are updated through a rendering loop based on [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame).

The rendering loop make use of the [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) (RAF) method in most modern browsers. If RAF is not available, it is shimmed with a 16 ms timer using setTimeout and clearTimeout.

The rendering loop is enabled on an element-by-element basis when elements are enabled or disabled for use with Cornerstone.

The workflow is as follows:
 1. A draw() callback is registered with RAF;
 2. draw() is called by the browser just after a frame is displayed on screen;
 3. Once called,
   * if the element was scheduled for re-rendering, it is rendered and draw() is re-registered with RAF;
   * if the element was **not** scheduled for re-rendering, no work is performed and the callback is re-registered with RAF;
   * if the element was disabled(), the callback is **not** re-registered, ending the rendering loop.

This means that:
  * cornerstone.draw() and cornerstone.invalidate() do not trigger immediate rendering the viewport. Instead, they flag the image as needing re-rendering;
  * Each cornerstone element register its own RAF loop;
  * If the rendering time exceeds 16 ms on a 60 Hz system, rendering frames are skipped;
  * Only one render per frame is possible, even if render time is much lower than 16 ms;
  * All interactions (e.g. windowing, pan, zoom, etc...) are combined and rendered in the next frame.
