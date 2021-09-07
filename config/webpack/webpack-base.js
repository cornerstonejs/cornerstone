const path = require('path');
const webpack = require('webpack');
const rootPath = process.cwd();
const context = path.join(rootPath, "src");
const outputPath = path.join(rootPath, 'dist');
const bannerPlugin = require(path.join(__dirname, 'plugins', 'banner.js'));

module.exports = {
  mode: 'development',
  context: context,
  entry: {
    cornerstone: path.join(context, 'index.js')
  },
  target: 'web',
  output: {
    filename: '[name].js',
    library: {
      commonjs: "cornerstone-core",
      amd: "cornerstone-core",
      root: 'cornerstone'
    },
    libraryTarget: 'umd',
    path: outputPath,
    umdNamedDefine: true
  },
  devtool: 'source-map',
  externals: {},
  module: {
    rules: [{
      enforce: 'pre',
      test: /\.js$/,
      exclude: /(node_modules)/,
      loader: 'eslint-loader',
      options: {
        failOnError: false
      }
    }, {
      test: /\.js|ts$/,
      exclude: /(node_modules)/,
      use: [{
        loader: 'babel-loader'
      }]
    }]
  },
  plugins: [
    bannerPlugin()
  ]
};
