---
description: Cornerstone can be made to support legacy browsers by incorporating polyfills for some modern web browser features.
---

# Legacy Browser Support

> Cornerstone can be made to support legacy browsers by incorporating polyfills for some modern web browser features.

You **may** need to include polyfills for these features, depending on which browsers you target.

* [Promises](https://caniuse.com/#feat=promises) represent the eventual result of an asynchronous operation. These are used by [Image Loaders](../concepts/image-loaders.md). You will need to polyfill Promises to use Internet Explorer 11. Here is [a lightweight Promise polyfill](https://github.com/taylorhakes/promise-polyfill) which is MIT Licensed.

* [requestAnimationFrame](https://caniuse.com/#feat=requestanimationframe) is a method for efficiently running animations. We currently [check for its availability ourselves within Cornerstone](https://github.com/cornerstonejs/cornerstone/blob/master/src/internal/requestAnimationFrame.js), but may remove this in the future. There are many options for a [requestAnimationFrame polyfill in this gist by Paul Irish](https://gist.github.com/paulirish/1579671).

* [performance.now](https://caniuse.com/#feat=high-resolution-time) is used for high-resolution timing for performance monitoring within Cornerstone. We are currently [avoiding errors ourselves within Cornerstone](https://github.com/cornerstonejs/cornerstone/blob/master/src/internal/now.js#L11), but may remove this in the future. Here is a [performance.now polyfill](https://gist.github.com/paulirish/5438650).

* [WebGL](https://caniuse.com/#feat=webgl) is used for hardware acceleration in our [optional high-performance rendering path](./webgl-rendering-pipeline.md). WebGL 1.0 is well supported but may still have issues in some browsers, which is why it is not enabled by default. We currently provide a [fallback pathway on WebGL failure](https://github.com/cornerstonejs/cornerstone/blob/master/src/webgl/renderer.js#L80) so that rendering can continue via HTML5 Canvas APIs.

**Note:** There may be further tests which could be added to the core codebase to trigger automatic fallback to Canvas rendering. If you have any specific suggestions, feel free to open an issue to discuss this.
