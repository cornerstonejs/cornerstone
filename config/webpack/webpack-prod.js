const webpack = require('webpack');
const merge = require('./merge');
const baseConfig = require('./webpack-base');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const devConfig = {
  output: {
    filename: '[name].min.js'
  },
  mode: "production",
  optimization: {
    minimizer: [
      new UglifyJSPlugin({
        uglifyOptions: {
          sourceMap: true
        }
      })
    ]
  },
};

module.exports = merge(baseConfig, devConfig);
