Backlog:
========
* more viewport functionality
  * Non linear LUTs (modality & voi)
  * pseudo color tables (for PET, MRI)
* Enhance cache to work with multiframe sop instance case
* [ASM.JS](http://asmjs.org/) version of storedPixelDataToCanvasImageData and generateLut
* [Native Client](https://developers.google.com/native-client/dev/) version of storedPixelDataToCanvasImageData
* [SIMD.JS](https://hacks.mozilla.org/2014/10/introducing-simd-js/) version of storedPixelDataToCanvasImageData and generateLut?
and generateLut
* Very large image support (e.g. pathology > 4kx4k resolution)
* Performance related
  * switch to lower resolution image during ww/wc operation to improve framerate
  * only regenerate the part of the rendered image that is actually visible - perhaps by tiling it
* Consider having multiple renderCanvas or one per enabled element
* Pixel data management
  * Caching of pixel data to HTML5 local storage?
* Packaging/build related
  * jquery plugin wrapper to make it easier to use with jquery
* Create a CustomElement for cornerstone images http://www.html5rocks.com/en/tutorials/webcomponents/customelements/
* Consider Prioritized image loading (primary, secondary, thumbnail, prefetch)
* Packaging/build related
  * AMD wrapper to make it easier to use with AMD loaders
* Sharing of LUT's between multiple viewports for linked ww/wc use case
