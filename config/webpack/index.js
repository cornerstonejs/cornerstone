const path = require('path');
const env = process.env.ENV || 'dev';
const config = require(path.join(__dirname, `webpack-${env}`));

module.exports = config;