Roadmap
========

Phase 2 (in progress)
-------
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


Phase 1 / proof of concept (DONE!)
-------
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

