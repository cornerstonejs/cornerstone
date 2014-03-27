Backlog:
========
 * Tools
   * Support for touch
   * Support for being active by more than one input mechanism (e.g. left mouse and right mouse or left mouse and mouse wheel)
   * Updating related handles while resizing (e.g. resize top left handle of a rect and update the bottom left and top right as it changes)
   * Scroll tool remember viewport settings when changing to another stack
   * Angle tool
   * Measurement calibration tool
   * Freehand ROI tool
   * Stack synchronization tool
   * Image pan/zoom synchronization tool
 * Examples showing touch UI
 * load images from a server (not the example embedded images)
   * Custom ImageLoader plugin (with corresponding server)
 * API documentation
 * Code cleanup (it is really messy and violates lots of stuff that jshint would catch)
 * Testing for other browsers and platforms (automated if possible)
 * Cine clip support via HTML5 video tag
 * Image support
    * color image support
    * Large image support (e.g. mammo, large CR > 512x512 resolution )
    * Very large image support (e.g. pathology > 4kx4k resolution)
 * more viewport functionality
     * Rotation (90, 180, 270, 0)
     * Flip (Horizontal / Vertical)
     * invert
     * non square pixels (pixel spacing is not the same vertically and horizontally)
     * Non linear LUTs (modality & voi)
     * Turn on/off interpolation of image pixels
 * look for libraries to use instead of writing our own code for:
    * statistics - standard deviation, mean, etc
    * geometry - point, plane, line, circle, matrix
    * Image processing - filters
    * RESTful calls (cujo.js rest library)
    * DICOM parsing
    * DICOM transfer syntax decoding (e.g. jpeg-ls)
 * Performance related
   * Multiresolution image streaming (improve time to first image by first getting a 128x128 version of image then get rest of pixels)
   * image compression - JPEG, gzip
   * Optimize image display (lut generation, stored pixel data -> canvas, etc)
   * switch to lower resolution image during ww/wc operation to improve framerate
   * only regenerate rendered image if ww/wc changes - that way pan/zoom is faster
   * only regenerate the part of the rendered image that is actually visible - perhaps by tiling it
 * Pixel data management
     * Caching of pixel data to HTML5 local storage?
     * image cache management
 * Packaging/build related
     * packaged as a bower module
     * jquery plugin wrapper to make it easier to use with jquery
     * AMD wrapper to make it easier to use with AMD loaders

Future Possibilities
=================================
  * 3D functionality - MPR, MIP, Volume Rendering
  * Fusion (e.g. PET/CT, CT/MR)
