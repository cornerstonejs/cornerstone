cornerstone
===========

The goal of this project is to make it easy to enable HTML5 based web apps to display interactive medical images:

 * Easy - use of the library should be familiar for someone with experience in web technologies - knowledge of DICOM
or medical imaging should not be required
 * Medical images - this includes all DICOM image types as well as non DICOM Image types
 * Interactive - All rendering is done on the client side including window/level, zoom, pan, etc.

This project was initiated based on the following comp.protocols.dicom discussion:
https://groups.google.com/forum/#!topic/comp.protocols.dicom/_2fMh69GdAM

[Trello](https://trello.com/b/tGTDIyt4/cornerstone)

[Live Examples](https://rawgithub.com/chafey/cornerstone/master/example/index.html)

Vision
======
 * Supports all HTML5 based browsers
 * Runs on mobile, tablet and desktop
 * Displays all DICOM image types
 * Displays non DICOM image types (e.g. JPEG from camera)
 * High performance image display
 * Server software can run on Linux, Windows and Mac OS X
 * Server provides plugin interface to allow interfacing with image archives in different ways (e.g. DICOM port 104, WADO, custom)

Roadmap
========

Phase 1
-------
 * Supports all HTML5 based browsers (including mobile, tablet and desktop).  Specific targets include:
    * IE9+
    * Chrome
    * Safari
    * FireFox
    * Opera
 * Server software shall be cross platform and run on Linux, Windows and Mac OS X
 * Supports display of all DICOM Image formats (8 bit gray, 16 bit gray, RGB, etc)
 * All image rendering done on client side (server only returns raw pixel data)
 * Programmatic support for modifying the following:
    * Window/Center adjustments
    * Zooming/Scaling
    * Panning/Translating
    * Rotation (90, 180, 270, 0)
    * Flip (Horizontal / Vertical)
    * Image displayed
 * Markup mode - static configuration done via HTML5 data- attributes, no javascript needed

Phase 2
-------
 * Configurable interactive tools
 * Overlays

Future Possibilities
=================================
* 3D functionality - MPR, MIP, Volume Rendering
* Fusion (e.g. PET/CT, CT/MR)
