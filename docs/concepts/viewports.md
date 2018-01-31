# Viewports

Each enabled element has a viewport which describes how the image should be rendered.  The viewport for an enabled element can be obtained via the getViewport() function and set using the setViewport() function.  The viewport parameters are:

* scale - The scale applied to the image.  A scale of 1.0 will display no zoom (one image pixel takes up one screen pixel). A scale of 2.0 will be double zoom and a scale of .5 will be zoomed out by 2x
* translation - an object with properties x and y which describe the translation to apply in the pixel coordinate system.  Note that the image is initially displayed centered in the enabled element with a x and y translation of 0 and 0 respectively.
* voi - an object with properties windowWidth and windowCenter.
* invert - true if the image should be inverted, false if not.
* pixelReplication - true if the image smooth / interpolation should be used when zoomed in on the image or false if pixel replication should be used.
* hflip - true if the image is flipped horizontally.  Default is false
* vflip - true if the image is flipped vertically.  Default is false
* rotation - the rotation of the image (90 degree increments).  Default is 0
* modalityLUT - the modality LUT to apply or undefined if none
* voiLUT - the VOI LUT to apply or undefined if none

In the future, support will be added for the following
* pseudo color tables (for PET / MRI)
