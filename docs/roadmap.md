Roadmap/Status
==============

Alpha but stable

Phase 4 (in progress)
---------------------
 * Turn on/off interpolation of image pixels (DONE)
 * Performance optimization for zoom/pan operations (DONE)
 * Example for invert functionality (DONE)
 * Example for interpolation on/off (DONE)
 * Consider moving the markup functionality to another library (DONE - Deleted for now)
 * Code cleanup / refactoring / documentation
 * Consider moving setToFontCoordinateSystem and setToPixelCoordinateSystem to tools library?
   * might be best to consolidate them into one function and provide an optional fontScale
     parameter to trigger font scaling?
 * Packaging/build related
     * packaged as a bower module
 * Rendering of non square pixels (pixel spacing is not the same vertically and horizontally)

Phase 3 (completed April 11, 2014)
---------------------
 * Code cleanup / refactoring / documentation (done)
 * run jshint on build (done)
 * ImageLoader design (done - in wiki)
 * ImageLoader API Documentation (done - in wiki)
 * WADO ImageLoader plugin (done - now cornerstoneWADOImageLoader project)
 * Extract tools to separate library (done - now cornerstoneTools project)
 * Optimize image display (done - lut generation, stored pixel data -> canvas, etc) (done)
 * Invert image (done - need example though)
 * Support for high dpi displays (e.g. retina) (done)

Phase 2 (completed March 27, 2014)
------------------
 * Tool framework
   * Data management
   * Handle helpers
   * Tool dragging
   * Drawing Geometry
   * Drawing Text
   * Coordinate conversion helper from page coordinate to image coordinate
 * Interaction paradigm
   * Tool adjustment through handles
   * Delete by dragging tool off screen
   * Tool states
 * Generic tools for interactively adjusting window width/window center, zoom, pan and scroll
   * WW/WC
   * Pan
   * Zoom
   * Stack Scroll
   * Length Measurement
   * Pixel Probe
   * Rectangle ROI
   * Elliptical ROI
 * Viewport Event - fired every time a viewport property changes
 * Render Event - fired every time the image is rendered (useful for generating overlays)

Phase 1 / proof of concept (completed March 19, 2014)
----------------------------------
 * Target browser OS: Mac OS X (desktop)
 * Target browser: Google Chrome
 * Display of 16 bit unsigned MRI Image from pixel data embedded in javascript (no server)
 * Image rendered using Modality LUT transform and VOI LUT Transform
 * Programmatic support for modifying the following:
    * Window/Center adjustments
    * Zooming/Scaling
    * Panning/Translating
    * Image displayed
 * Markup mode - static configuration done via HTML5 data attributes, no javascript needed
 * grunt based build system to create minified version

