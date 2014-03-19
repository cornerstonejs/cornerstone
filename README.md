cornerstone
===========

The goal of this project is to make it easy to enable HTML5 based web apps to display interactive medical images:

 * Easy - use of the library should be familiar for someone with experience in web technologies - knowledge of DICOM
or medical imaging should not be required
 * Medical images - this includes all DICOM image types as well as non DICOM Image types
 * Interactive - All rendering is done on the client side including window/level, zoom, pan, etc.

[Click here to see live examples](https://rawgithub.com/chafey/cornerstone/master/example/index.html)

Project Status: Proof of concept

This project was initiated based on the following comp.protocols.dicom discussion:
https://groups.google.com/forum/#!topic/comp.protocols.dicom/_2fMh69GdAM

[Trello](https://trello.com/b/tGTDIyt4/cornerstone)

Vision
======
 * Supports all HTML5 based browsers
 * Runs on mobile, tablet and desktop
 * Displays all DICOM image types
 * Displays non DICOM image types (e.g. JPEG from camera)
 * High performance image display
 * Server software can run on Linux, Windows and Mac OS X
 * Server provides plugin interface to allow interfacing with image archives in different ways (e.g. DIMSE, WADO, custom)

Roadmap
========

Phase 1 (proof of concept)
-------
 * Target browser OS: Mac OS X (desktop)
 * Target browser: Google Chrome
 * Display of 16 bit unsigned MRI Image from hardcoded pixel data (no server, just HTTP Get)
 * All image rendering done on client side (server only returns raw pixel data)
 * Programmatic support for modifying the following:
    * Window/Center adjustments
    * Zooming/Scaling
    * Panning/Translating
    * Image displayed
 * Markup mode - static configuration done via HTML5 data attributes, no javascript needed

Backlog:
========
 * build server
 * Events - image updated, viewport property changed, etc
 * More browser platforms
   * image tiling to workaround iOS canvas size limitation
 * More server platforms
 * More image types
 * more viewport functionality
     * Rotation (90, 180, 270, 0)
     * Flip (Horizontal / Vertical)
 * Performance related
   * Multiresolution image streaming
   * image compression
 * Overlays
 * server plugin to communicate archive via DIMSE
 * server plugin to communicate archive via WADO
 * Prebuilt tools for common ui paradigms (e.g. left click w/l, mouse wheel zoom, middle mouse pan)
 * Programmatic access to raw pixel data (for tools like ROI)
 * Caching of pixel data to HTML5 local storage?
 * image cache management

Future Possibilities
=================================
 * 3D functionality - MPR, MIP, Volume Rendering
 * Fusion (e.g. PET/CT, CT/MR)
