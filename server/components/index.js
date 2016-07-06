"use strict";

module.exports.init = function (app, callback) {

    // put init fn here

    require('./routes')(app);

    callback()
};