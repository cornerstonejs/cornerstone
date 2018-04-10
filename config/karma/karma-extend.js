const baseConfig = require('./karma-base.js');

module.exports = function (extendedConfig) {
  'use strict';
  // Overrides the base configuration for karma with the given properties
  for (var i in baseConfig) {
    if (typeof extendedConfig[i] === 'undefined') {
      extendedConfig[i] = baseConfig[i];
    }
  }
  return extendedConfig;
};
