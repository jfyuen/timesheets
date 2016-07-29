"use strict";


const path = require('path'),
    express = require('express'),
    config = require('./config');

var app = express();

app.use(express.static(path.join(config.root, 'static')));

require('./components').init(app, function (err) {

    if (err)
        console.log(err);
    else
        app.listen(config.port, config.ip, function () {
            console.info('Express server listening on %d, in %s mode', config.port, config.env)
        })
});


