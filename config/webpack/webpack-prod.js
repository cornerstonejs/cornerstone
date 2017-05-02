const webpack = require('webpack');
const merge = require('./merge');
const baseConfig = require('./webpack-base');
const devConfig = {
  output: {
    filename: '[name].min.js'
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true
    })
  ]
};

module.exports = merge(baseConfig, devConfig);