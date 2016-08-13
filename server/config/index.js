'use strict';

const _ = require('lodash'),
    path = require('path');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var root = path.normalize(__dirname + '/../..');
process.env.DB_PATH = process.env.DB_PATH || root;

var all = {
    root: root,
    ip: '0.0.0.0',
    port: process.env.PORT || 8080,
    dbPath: process.env.DB_PATH || root,
    env: process.env.NODE_ENV
};

var env = {
    'development': {
        ip: '0.0.0.0',
        port: 8081
    },
    'production': {}
}

module.exports = _.extend(all, env[process.env.NODE_ENV]);