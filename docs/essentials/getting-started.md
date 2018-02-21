# Getting Started

> We will be using [ES2015](https://github.com/lukehoban/es6features) in the code samples in the guide.

Cornerstone.js provides a rock solid foundation for creating a web medical image viewer. However, it is purposefully light weight and extensible. After configuring an image loader (getting your images to display), the next thing you'll want to do is manipulate those images, apply annotations, and provide additional tools for diagnosis and research. CornerstoneTools sets out to provide tools for these common use cases. Here's a basic example:

### HTML

``` html
<!-- Scripts -->
<!-- Cornerstone Tools External Dependencies -->
<script src="https://unpkg.com/hammerjs@2.0.8/hammer.js"></script>

<!-- Cornerstone Latest -->
<script src="https://unpkg.com/cornerstone-core"></script>
<script src="https://unpkg.com/cornerstone-math"></script>
<script src="https://unpkg.com/cornerstone-web-image-loader"></script>

<!-- Cornerstone Tools Latest -->
<script src="https://unpkg.com/cornerstone-tools"></script>

<script>
  // TODO: This should happen automatically.
  cornerstoneWebImageLoader.external.cornerstone = cornerstone
</script>

 <!-- WRAPPER -->
<div
  class="image-canvas-wrapper"
  oncontextmenu="return false"
  unselectable='on'
  onselectstart='return false;'
  onmousedown='return false;'
>
  <!-- DICOM CANVAS TARGET -->
  <div
    class="image-canvas"
    oncontextmenu="return false"
  ></div>
</div>
```

### JavaScript

Loading libraries as modules is similar, but with one small caveat. We try not to pollute the global namespace, so each library's external dependencies needs to be explicitly linked. You can find documentation on how to do this [in the installation section](/installation.md)

``` js
// If we were using the cornerstoneWADOImageLoader, we could load .dcm files
// The cornerstoneWebImageLoader supports loading and displaying .jpg and .png files
const exampleImageId = 'path/to/example-image.jpg'
const element = document.querySelector('.image-canvas')

// Injects cornerstone "enabled" canvas into DOM
cornerstone.enable(element)

// Load & Display
cornerstone
  .loadImage(exampleImageId)
  .then(function (image) {

    // Now that we've "loaded" the image, we can display it on
    // our Cornerstone enabled element of choice
    cornerstone.displayImage(element, image)

    // We need to enable each way we'd like to be able to receive
    // and respond to input (mouse, touch, scrollwheel, etc.)
    cornerstoneTools.mouseInput.enable(element)
    cornerstoneTools.touchInput.enable(element)

    // Activate mouse tools we'd like to use
    cornerstoneTools.wwwc.activate(element, 1) // left click
    cornerstoneTools.pan.activate(element, 2) // middle click
    cornerstoneTools.zoom.activate(element, 4) // right click

    // Activate Touch / Gesture tools we'd like to use
    cornerstoneTools.wwwcTouchDrag.activate(element) // - Drag
    cornerstoneTools.zoomTouchPinch.activate(element) // - Pinch
    cornerstoneTools.panMultiTouch.activate(element) // - Multi (x2)
  })
```

### CSS

> Note: The canvas viewer is NOT responsive out of the box. To find how to implement a responsive viewer, check out this example: COMING SOON

```css
.image-canvas-wrapper {
  width: 500px;
  height: 325px;
  margin: 35px auto;
  background: black;
}
.image-canvas {
  width: 100%;
  height: 100%;
}

body {
  background: dodgerblue;
}
```

You can also check out this example [live](https://codepen.io/dannyrb/pen/YYzxma).
