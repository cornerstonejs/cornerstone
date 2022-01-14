---
description: The Pixel Coordinate System is used when referring to individual pixels in the image and supports sub-pixel precision.
---

# Pixel Coordinate System

The Pixel Coordinate System is used when referring to individual pixels in the image and supports sub-pixel precision. The origin of the coordinate system is such that 0.0,0.0 is the top left corner of the top left pixel in the image and columns, rows would be the bottom right corner of the bottom right pixel in the image. A coordinate of .5,.5 is therefore the center of the top left pixel.

1. The function [pageToPixel()](../api.md#pagetopixel) can be used to convert coordinates obtained from browser events to coordinates
in the pixel coordinate system.
2. The function [setToPixelCoordinateSystem()](../api.md#settopixelcoordinatesystem) can be used to set the canvas context to the pixel coordinate system.  This is useful when handling the CornerstoneImageRendered event to draw geometry on top of the image.
3. This coordinate system matches that specified in the DICOM Grayscale Softcopy Presentation State Graphic Annotation module for graphics drawn using the PIXEL annotation units.
4. Use Math.ceil() to convert from the pixel coordinate system to the integer pixel number (for looking up the pixel value in the pixel data).

## Example

```javascript
element = document.querySelector('.cornerstone-element')
$(element).on('cornerstoneimagerendered', (e) => {
  this.cornerstone.setToPixelCoordinateSystem(e.detail.enabledElement, e.detail.canvasContext);
    let context = e.detail.canvasContext
    
    //save canvas settings
    context.save()
    
    context.strokeStyle = 'green'
    context.beginPath()
    context.lineWidth = 1 / e.detail.viewport.scale
    context.strokeRect(100,100,100,100)

    //restore canvas settings to previous state
    context.restore()
})
```