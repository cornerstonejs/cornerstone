const env = process.env.ENV || 'dev';
const config = require(`./webpack-${env}`);

module.exports = config;