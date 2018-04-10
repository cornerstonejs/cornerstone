const webpackConfig = require('./webpack.config.js');

// Deleting output.library to avoid "Uncaught SyntaxError: Unexpected token /" error
// when running testes (var test/foo_test.js = ...)
delete webpackConfig.output.library;

module.exports = function (config) {
  config.set({
    basePath: './',
    singleRun: true,
    browsers: ['ChromeHeadlessNoSandbox'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    },
    frameworks: ['mocha'],
    reporters: ['progress', 'coverage'],
    files: [
      'test/*_test.js',
      'test/**/*_test.js'
    ],

    plugins: [
      require('karma-webpack'),
      require('karma-mocha'),
      require('karma-chrome-launcher')
    ],

    preprocessors: {
      'test/*_test.js': ['webpack'],
      'test/**/*_test.js': ['webpack']
    },

    webpack: webpackConfig,

    webpackMiddleware: {
      noInfo: false,
      // Use stats to turn off verbose output
      stats: {
        // Options i.e.
        chunks: false,
        colors: true,
        timings: false,
        errorDetails: true
      }
    }
  });
};
