"use strict";


const path = require('path'),
    express = require('express'),
    config = require('./config'),
    db = require('./components/db'),
    cors = require('cors');
const app = express();

var allowedOrigins = ['http://localhost:3000',
                      'http://localhost:8081'];
app.use(cors({
    origin: function(origin, callback){    // allow requests with no origin
        // (like mobile apps or curl requests)
        if(!origin) {
            return callback(null, true);
            }
        if(allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not ' +
                    'allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));
const bodyParser = require('body-parser');

app.use(express.static(path.join(config.root, 'build')));
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

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
