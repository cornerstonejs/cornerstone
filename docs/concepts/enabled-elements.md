---
description: In Cornerstone, an Enabled Element is an HTMLElement which we display an interactive medical image inside of.
---

# Enabled Elements

> In Cornerstone, an **Enabled Element** is an [HTMLElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement) (typically a [div](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/div)) which we display an interactive medical image inside of.

To display an image, a web developer needs to do the following:

1. Reference the Cornerstone JavaScript library file via a script tag in a web page
2. Reference the JavaScript file for one or more [Image Loaders](image-loaders.md) that Cornerstone will use to actually load the pixel data (e.g. WADO, WADO-RS, custom) in the web page
3. Add an element to the DOM that will be used to display the image inside of
4. Use CSS to position the element on the page along with the desired width and height
5. Call the [enable()](../api.md#enable) API to prepare the element to display images
6. Load an image using the [loadImage()](../api.md#loadimage) API
7. Display the loaded image using the [displayImage()](../api.md#displayimage) API

See the [minimal example](https://rawgit.com/chafey/cornerstone/master/example/jsminimal/index.html) for the minimum code required to use cornerstone.

You may also want to include the [Cornerstone Tools Library](https://github.com/chafey/cornerstoneTools) for ready-to-go tools such as windowing, pan, zoom and measurements.
