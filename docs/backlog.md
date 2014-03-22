Backlog:
========
 * Examples showing touch UI
 * load images from a server (not the example embedded images)
   * WADO ImageLoader plugin
   * Custom ImageLoader plugin (with corresponding server)
 * More browser platforms
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
 * Find a math/geometry library with transformation matrix, points, vectors and planes
 * Performance related
   * Multiresolution image streaming
   * image compression
   * Optimize image display
 * developer api
     * Programmatic access to raw pixel data (for tools like ROI)
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
