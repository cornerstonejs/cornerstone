# Version 0.10.9

- Migrate to new build process with Webpack and Babel. Remove grunt.
- Migrate to ES6 modules (@brunoalvesdefaria, @zachasme, @lscoder, @jpambrun, @jasonklotzer)
- Fix issue #115: Grayscale not inverting properly
- Fix typo in Date.now for performance timing fallback when window.performance is not available

# Version 0.10.8

- Performance improvements for LUT generation (@jpambrun)

# Version 0.10.7

- Revert fix for #101 since it's reducing performance