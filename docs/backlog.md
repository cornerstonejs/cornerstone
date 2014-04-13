Backlog:
========

V1.0 (target to release by May 15 for SIIM 2014
------------
 * API documentation
 * Testing for other browsers and platforms (automated if possible)
 * Image support
    * color image support
    * Large image support (e.g. mammo, large CR > 512x512 resolution )
 * Pixel data management
     * image cache management
 * Packaging/build related
     * AMD wrapper to make it easier to use with AMD loaders

Beyond v1.0:
------------
 * [ASM.JS](http://asmjs.org/) version of storedPixelDataToCanvasImageData and generateLut
 * [Native Client](https://developers.google.com/native-client/dev/) version of storedPixelDataToCanvasImageData
   and generateLut
 * Cine clip support via HTML5 video tag
 * Image support
    * Very large image support (e.g. pathology > 4kx4k resolution)
 * more viewport functionality
     * Rotation (90, 180, 270, 0)
     * Flip (Horizontal / Vertical)
     * Non linear LUTs (modality & voi)
 * Performance related
   * switch to lower resolution image during ww/wc operation to improve framerate
   * only regenerate the part of the rendered image that is actually visible - perhaps by tiling it
 * Pixel data management
     * Caching of pixel data to HTML5 local storage?
 * Packaging/build related
     * jquery plugin wrapper to make it easier to use with jquery
  * 3D functionality - MPR, MIP, Volume Rendering
  * Fusion (e.g. PET/CT, CT/MR)
 * Create a CustomElement for cornerstone images http://www.html5rocks.com/en/tutorials/webcomponents/customelements/
   * use http://www.polymer-project.org/ to polyfill
