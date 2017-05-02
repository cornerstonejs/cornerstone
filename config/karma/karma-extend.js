module.exports = function (extendedConfig) {
  'use strict';
  var baseConfig = require('./karma-base.js');
  // Overrides the base configuration for karma with the given properties
  for (var i in baseConfig) {
    if (typeof extendedConfig[i] === 'undefined') {
      extendedConfig[i] = baseConfig[i];
    }
  }
  return extendedConfig;
};
