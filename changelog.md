# Version 1.0.1

- Switch package.json 'main' to minified version to reduce bundle sizes
- jQuery removed from tests (thanks @maistho)

# Version 1.0.0

- Updated to 1.0.0 because 0.13.1 introduced a breaking change with jQuery injection. This doesn't break usage if you are using HTML script tags, but if you are using Cornerstone in a module system, Cornerstone may not properly find jQuery.

The solution for this is to inject your jQuery instance into Cornerstone as follows:

````javascript
cornerstone.external.$ = $;
````

An example commit doing this in the OHIF Viewer Meteor application is here: https://github.com/OHIF/Viewers/commit/012bba44806d0fb9bb60af329c4875e7f6b751e0#diff-d9ccd906dfc48b4589d720766fe14715R25

We apologize for any headaches that the breaking change 0.13.1 may have caused for those using module systems.

# Version 0.13.2 (deprecated due to breaking change)

- Added native CustomEvents that are triggered parallel to the jQuery events. This is part of a transition to drop the jQuery dependency entirely.
- Added the EventTarget interface to cornerstone.events. You can now use cornerstone.events.addEventListener to listen to events. The parallel events have the same names as the current events, but are all lower case.

e.g. CornerstoneImageRendered has a native CustomEvent name 'cornerstoneimagerendered'

# Version 0.13.1 (deprecated due to breaking change)

- Updated dependencies
- Added JQuery as an injection dependency
- Properly reexport reference to isWebGLInitialized from WebGL module

# Version 0.13.0

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

# Version 0.12.2

- Fix VOILUT rendering for Agfa images (issue #106)

# Version 0.12.1

- Fix NPM dependencies, added this changelog
- Fix viewport sync in composite image example 

# Version 0.12.0

- Add layer API support for drawing composite images
- Remove globals from eslintrc.js
- Fix broken event firing for WebGL texture cache

# Version 0.11.1

- Add a 'CornerstonePreRender' event that is fire before the image is rendered
- Switch module imports to include '.js' extensions to improve support for Chrome native modules

# Version 0.11.0

- Switch events to fire on cornerstone.events instead of cornerstone. This was broken when Cornerstone was loaded as a module.
  Note: If you are currently using $(cornerstone).on(...) to monitor image load progress or cache changes, you need to change this to
  $(cornerstone.events).on(...)

- Add previous image information in CornerstoneNewImage event
- Fix build issues on Windows
- Fix missing devDependency for Istanbul in package.json
- Add a number of unit tests, ESLint fixes, and JSDoc comments

# Version 0.10.10

- Fix issues with package.json and Webpack configuration

# Version 0.10.9

- Migrate to new build process with Webpack and Babel. Remove grunt.
- Migrate to ES6 modules (@brunoalvesdefaria, @zachasme, @lscoder, @jpambrun, @jasonklotzer)
- Fix issue #115: Grayscale not inverting properly
- Fix typo in Date.now for performance timing fallback when window.performance is not available

# Version 0.10.8

- Performance improvements for LUT generation (@jpambrun)

# Version 0.10.7

- Revert fix for #101 since it's reducing performance
