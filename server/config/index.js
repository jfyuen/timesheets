'use strict';

const _ = require('lodash'),
    path = require('path');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var all = {
    root: path.normalize(__dirname + '/../..'),
    ip: '0.0.0.0',
    port: process.env.PORT || 8080
};

module.exports = _.extend(all, require('./env/' + process.env.NODE_ENV + '.js') || {});