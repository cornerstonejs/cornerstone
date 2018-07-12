const webpack = require('webpack');
const merge = require('./merge');
const baseConfig = require('./webpack-base');

const devConfig = {
  devServer: {
    hot: true,
    publicPath: '/dist/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin({})
  ]
};

module.exports = merge(baseConfig, devConfig);
