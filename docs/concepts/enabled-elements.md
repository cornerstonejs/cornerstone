# Enabled Elements

In cornerstone, an **Enabled Element** is an HTML DOM node (typically a DIV) which cornerstone displays an interactive medical image inside of.  To display an image, a web developer needs to do the following:

1. Reference the Cornerstone JavaScript library file via a script tag in a web page
2. Reference the JavaScript file for one or more [Image Loaders](image-loaders.md) that Cornerstone will use to actually load the pixel data (e.g. WADO, WADO-RS, custom) in the web page
3. Add an element to the DOM that will be used to display the image inside of
4. Use CSS to position the element on the page along with the desired width and height
5. Call the [enable()](enable-api) api to prepare the element to display images
6. Load an image using the [loadImage()](loadImage-api) api
7. Display the loaded image using the [displayImage()](displayImage-api) api

See the [minimal example](https://rawgit.com/chafey/cornerstone/master/example/jsminimal/index.html) for the minimum code required to use cornerstone.

You may also want to include the [Cornerstone Tools Library](https://github.com/chafey/cornerstoneTools) for ready to go tools such as windowing, pan, zoom and measurements.
