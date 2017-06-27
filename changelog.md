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