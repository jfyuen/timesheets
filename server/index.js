"use strict";


const path = require('path'),
    express = require('express'),
    config = require('./config'),
    db = require('./components/db');

var app = express();

app.use(express.static(path.join(config.root, 'static')));

require('./components').init(app, function (err) {

    if (err) {
        console.log(err);
    } else {
        app.listen(config.port, config.ip, function () {
            console.info('Express server listening on %d, in %s mode', config.port, config.env)
        });
    }
});

function exitHandler(options, err) {
    if (options.cleanup) {
        db.close();
    }
    if (err) {
        console.log(err.stack);
    }
    if (options.exit) {
        process.exit();
    }
}

process.on('exit', exitHandler.bind(null, { cleanup: true }));

process.on('SIGINT', exitHandler.bind(null, { exit: true }));

process.on('uncaughtException', exitHandler.bind(null, { exit: true }));
