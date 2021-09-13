# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [2.3.0] - 2019-07-03
### Added
- Added `setDefaultViewport()` as an exposed internal API method

## [2.2.8] - 2018-12-05
### Added
- Added default export named 'cornerstone' to the module

## [2.2.7] - 2018-10-25
### Changed
- Deprecate enabledElement.options.colormap option
- Fix rowPixelSpacing and columnPixelSpacing not to be null (default to 1)
- jsdocs changes

## [2.2.6] - 2018-09-24
### Added
- Broadcast `ELEMENT_DISABLED` event when disabling a new element on the `events` object

### Changed
- Broadcast `ELEMENT_ENABLED` event off `events` object instead of per element

## [2.2.5] - 2018-09-24
### Added
- Broadcast `ELEMENT_ENABLED` event when enabling a new element
- enabledElements now have an associated unique id (`enabledElement.uuid`)

## [2.2.4] - 2018-05-04
### Removed
- Removed old fix for clearing the canvas after swaping between 2 colorSpaces (issue #151)

## [2.2.3] - 2018-05-02
### Fixed
- Fixed multiple images with different colorSpaces not being rendered correctly (issue #151) 
- Fixed memory leak in drawCompositeImage.syncedViewports (issue #179)
- Fixed all the build warnings in the test folder

### Added
- Added unit tests for displayed area feature
- Added 'renderToCanvas' to allow user to directly draw an image to an existent canvas

## [2.2.2] - 2018-04-23
### Added
- Added "dist" folder to published package.

## [2.2.1] - 2018-04-23
### Fixed
- Fixed viewport scale is NaN when row/col pixel spacing is not present (Issue #262).

## [2.2.0] - 2018-04-11
### Added
- Added and exported EVENTS constants for all cornerstone events (thanks  @medihack)
- Added example for integration with React to the docs https://docs.cornerstonejs.org/integration.html
- Added compute VOI window width/center if not present (thanks @adreyfus)
- Added Displayed Area in Viewport to support IHE Consistent Presentation of Images (thanks @jdnarvaez)
- Added HTML example "displayedArea" with the IHE test cases for Consistent Presentation of Images

### Fixed
- Fixed WebGL Rendering to properly determine the datatype (e.g. color, int8, int16...) of the image pixel data
- Fixed fitToWindow and default viewport for images with different row/col pixel spacing (thanks @luyixin)

### Changed
- Updated project to Webpack4
- Updated the HTML example "modalityANDVIOLut" to show 1) Reset VOI LUT (forceAuto) and 2) Select a VOI from defined presets (W/L values or and VOI LUT function)
- Updated the HTML example "resize" to allow setting irregular image sizes (Row and Column pixel spacing) when applying fitting the image to window and zoom in/out

### Removed
- Removed "dist" folder from source


## [2.1.0] - 2018-03-02
### Added
- Added Gitbook and documentationjs for API docs
- Added new tests
- Added API to support setting the initial viewport for an image without displaying it (thanks @ClaireTagoe)
- Added support for event handler namespaces

### Fixed
- Fixed scrollbar issues by making the canvas a block element (thanks @medihack)
- Fixed image caching issues
- Fixed certain front-end framework (e.g. React) issues by avoiding manipulating the DOM when enabling an element
- Fixed scaling issue when resizing (thanks @medihack)


## [2.0.0] - 2017-12-08
### Changed
- *Breaking Change!!!* Removed jQuery events from triggerEvent, lower-cased all the event names. e.g. "CornerstoneWebGLTextureRemoved" is now "cornerstonewebgltextureremoved". Only native CustomEvents are now triggered by Cornerstone Core.
- *Breaking Change!!!* Image Loaders should now return an Object containing a promise and a function which can cancel the request. The format is { promise, cancelFn }. Migration guide to come...
- *Breaking Change!!!* Image cache now stores ImageLoadObjects as described above.

### Removed
- Removed 'commonjs2' parameter from webpack output.library options because it was complaining.
- Removed 'externals' since we no longer use jQuery
- *Breaking Change!!!* putImagePromise, getImagePromise have been removed and replaced with putImageLoadObject, getImageLoadObject


## [1.1.4] - 2017-12-08
### Added
- Added the ESLint plugin 'eslint-plugin-import' to keep us from forgetting .js on our imports. The file extension is required when using native ES6 modules in the browser.
- Added generateColorLut, which is basically the same as generateLut, but only applies VOI LUT transformation, and not the Modality LUT. This is intended to address the display issues reported in https://github.com/cornerstonejs/cornerstoneWADOImageLoader/issues/143

### Changed
- Moved the repository from Chris Hafey's (@chafey) personal page to a new Organization (@cornerstonejs). Renamed all the relevant links. Join us at @cornerstonejs to start contributing!
- Switched renderColorImage to use the newly created generateColorLUT, so that modality LUT transformations are no longer (incorrectly) applied to color images.

## [1.1.3] - 2017-11-17
### Added
- Exporting of triggerEvent function, mainly for use by image loader libraries

### Changed
- Switched rescaleImage to use image columnPixelSpacing instead of relying on metadataProvider (thanks @adreyfus)
- Switched this changelog to try to follow http://keepachangelog.com/en/1.0.0/


## Version 1.1.2

- Changed the CustomEvent polyfill check to use typeof. It was not working on IE.

## Version 1.1.1

- Added the CustomEvent polyfill for browsers which doesn't support it.
- Fixed lint issues that were being displayed during tests.

## Version 1.1.0

- Major changes:

In 1.1.0 we have added several rendering functions to support the use of layers for composite images.

- *renderPseudoColorImage*: This renders a grayscale image as a color image using a color lookup table after first applying the modality and VOI LUT transformations. This is the described approach for pseudo-color image display in the DICOM standard (http://dicom.nema.org/medical/dicom/current/output/chtml/part04/sect_N.2.html).

Previously, users had to use convertToFalseColorImage which converted the entire grayscale image to a color image, and then rendered the RGB pixels. Now, you can set the 'colormap' property on the viewport and the image will be displayed in false color. The False Color Mapping and Composite Images examples have been updated accordingly.

- *renderLabelMapImage*: In medical imaging it is very common to have results stored as label maps. Pixel values are set to arbitrary numbers which represent something specific in an image (e.g. 1 for heart, 2 for lung). These label maps do not require any modality LUT or VOI LUT transformations and can just be mapped to RGBA pixels through color lookup tables. Support for label maps has now (finally!) been added to Cornerstone. Just set the viewport property 'labelmap' to true and add a colormap and you can display a label map.

- *renderGrayscaleImage*: Now has support for rendering using either just the alpha channel or RGBA channels. This is required for proper layer support.
- Removed redundant code in renderWebImage which was being run before renderColorImage was being called. This should hopefully fix performance issues for Web images that have been reported (#164).
- More work towards dropping jQuery from @maistho: Trigger all jQuery events inside triggerEvent function (#185)
- Minor code cleanup, converted LookupTable to use ES6 Class syntax

## Version 1.0.1

- Switch package.json 'main' to minified version to reduce bundle sizes
- jQuery removed from tests (thanks @maistho)

## Version 1.0.0

- Updated to 1.0.0 because 0.13.1 introduced a breaking change with jQuery injection. This doesn't break usage if you are using HTML script tags, but if you are using Cornerstone in a module system, Cornerstone may not properly find jQuery.

The solution for this is to inject your jQuery instance into Cornerstone as follows:

````javascript
cornerstone.external.$ = $;
````

An example commit doing this in the OHIF Viewer Meteor application is here: https://github.com/OHIF/Viewers/commit/012bba44806d0fb9bb60af329c4875e7f6b751e0#diff-d9ccd906dfc48b4589d720766fe14715R25

We apologize for any headaches that the breaking change 0.13.1 may have caused for those using module systems.

## Version 0.13.2 (deprecated due to breaking change)

- Added native CustomEvents that are triggered parallel to the jQuery events. This is part of a transition to drop the jQuery dependency entirely.
- Added the EventTarget interface to cornerstone.events. You can now use cornerstone.events.addEventListener to listen to events. The parallel events have the same names as the current events, but are all lower case.

e.g. CornerstoneImageRendered has a native CustomEvent name 'cornerstoneimagerendered'

## Version 0.13.1 (deprecated due to breaking change)

- Updated dependencies
- Added JQuery as an injection dependency
- Properly reexport reference to isWebGLInitialized from WebGL module

## Version 0.13.0

- Removed the all `always` from imageCache's method decache to better stability
- Stop putImagePromise() if the image has been purged before being loaded
- Changed Webpack building file to output files as `cornerstone-core` for commonjs, commonjs2 and amd
- Add jquery names for commonjs, commonjs2 and amd
- Updated to Webpack 3
- Bug fixes for drawing composite images
- Bug fix for missing intercept value after false color mapping
- Math.floor instead of Math.round, to have correct values when v < Range[0] or v > Range[1] for linearIndexLookupMain
- Avoid setting canva's size with the same value, because it flashes the canvas with IE and Edge
- Remove parseInt to convert the values of pixelData
- Updated generateLut to generateLutNew
- drawCompositeImage synchronizes viewport.hflip
- Also synchronize vflip
- Trigger CornerstoneImageCacheMaximumSizeChanged and CornerstoneImageCacheChanged events when changing conerstone image cache
- Force cornerstone to generate a new LUT and use the color renderer after applying false color mapping

## Version 0.12.2

- Fix VOILUT rendering for Agfa images (issue #106)

## Version 0.12.1

- Fix NPM dependencies, added this changelog
- Fix viewport sync in composite image example

## Version 0.12.0

- Add layer API support for drawing composite images
- Remove globals from eslintrc.js
- Fix broken event firing for WebGL texture cache

## Version 0.11.1

- Add a 'CornerstonePreRender' event that is fire before the image is rendered
- Switch module imports to include '.js' extensions to improve support for Chrome native modules

## Version 0.11.0

- Switch events to fire on cornerstone.events instead of cornerstone. This was broken when Cornerstone was loaded as a module.
  Note: If you are currently using $(cornerstone).on(...) to monitor image load progress or cache changes, you need to change this to
  $(cornerstone.events).on(...)

- Add previous image information in CornerstoneNewImage event
- Fix build issues on Windows
- Fix missing devDependency for Istanbul in package.json
- Add a number of unit tests, ESLint fixes, and JSDoc comments

## Version 0.10.10

- Fix issues with package.json and Webpack configuration

## Version 0.10.9

- Migrate to new build process with Webpack and Babel. Remove grunt.
- Migrate to ES6 modules (@brunoalvesdefaria, @zachasme, @lscoder, @jpambrun, @jasonklotzer)
- Fix issue #115: Grayscale not inverting properly
- Fix typo in Date.now for performance timing fallback when window.performance is not available

## Version 0.10.8

- Performance improvements for LUT generation (@jpambrun)

## Version 0.10.7

- Revert fix for #101 since it's reducing performance
