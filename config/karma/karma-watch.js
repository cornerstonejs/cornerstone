const extendConfiguration = require('./karma-extend.js');

module.exports = function (config) {
  'use strict';
  config.set(extendConfiguration({
    browsers: ['ChromeHeadlessNoSandbox'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    }
  }));
};
