module.exports = function (config) {
  'use strict';
  var extendConfiguration = require('./karma-extend.js');
  config.set(extendConfiguration({
    singleRun: true,
    browsers: ['Firefox']
  }));
};
