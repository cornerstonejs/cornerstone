Roadmap
========

Phase 2 (in progress)
-------
 * Generic tools for interactively adjusting window width/window center, zoom, pan and scroll
 * Viewport Event - fired every time a viewport property changes
 * Render Event - fired every time the image is rendered (useful for generating overlays)
 * Overlay drawing


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

