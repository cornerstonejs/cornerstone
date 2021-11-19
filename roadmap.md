Roadmap/Status
==============

Status: Stable and in maintenance mode.  See backlog for future features that might be added

Phase 6 (completed May, 2014)
--------------------
 * API documentation
 * Testing for other browsers and platforms (automated if possible)

Phase 5 (completed April 17, 2014)
---------------------
 * Image support
    * color image support (DONE)
 * Pixel data management
     * image cache management (DONE)
 * Code cleanup / refactoring / documentation

Phase 4 (completed April 13, 2014)
---------------------
 * Turn on/off interpolation of image pixels (DONE)
 * Performance optimization for zoom/pan operations (DONE)
 * Example for invert functionality (DONE)
 * Example for interpolation on/off (DONE)
 * Consider moving the markup functionality to another library (DONE - Deleted for now)
 * Add support for resizing the enabled image (DONE)
 * Rendering of images with non square pixels (rowPixelSpacing != columnPixelSpacing) (DONE)
 * Consider moving setToFontCoordinateSystem and setToPixelCoordinateSystem to tools library? (DONE - moved setToFontCoordinateSystem to tools lib as setContextToDisplayFontSize)
 * Code cleanup / refactoring / documentation
   * rename viewport.centerX and viewport.centerY to be viewport.translation.x and viewport.translation.y (DONE)
   * rename viewport.windowWidth and viewport.windowCenter to be viewport.window.width  and viewport.window.center (DONE)
   * replace customEventPolyFill with our own event implementation so we don't cause side effects in other libraries
       that might try to do the same (DONE)
   * Consider making enable() not take an imageId or viewport and leave that up to showImage() instead (DONE - current api is fine, not doing this)
   * getViewport() to return a copy (DONE)
   * setViewport() to make a copy (DONE)
 * Packaging/build related
     * packaged as a bower module


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

