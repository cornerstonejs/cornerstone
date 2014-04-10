Backlog:
========
 * Consider moving the markup functionality to another library
 * API documentation
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
    * DICOM transfer syntax decoding (e.g. jpeg-ls)
 * Performance related
   * Multiresolution image streaming (improve time to first image by first getting a 128x128 version of image then get rest of pixels)
   * image compression - JPEG, gzip
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
 * Create a CustomElement for cornerstone images http://www.html5rocks.com/en/tutorials/webcomponents/customelements/
 * Move setToFontCoordinateSystem and setToPixelCoordinateSystem to tools library?
 *

Future Possibilities
=================================
  * 3D functionality - MPR, MIP, Volume Rendering
  * Fusion (e.g. PET/CT, CT/MR)
