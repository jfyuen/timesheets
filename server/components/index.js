"use strict";

const express = require("express");

var projects = require('./projects'),
    tasks = require('./tasks'),
    activities = require('./activities'),
    allocations = require('./allocations'),
    users = require('./users'),
    jnt = require('./jnt');

module.exports.init = function (app, callback) {

    //define routes
    var api = express.Router();
    app.use('/api', api);
    api.use('/projects', projects);
    api.use('/tasks', tasks);
    api.use('/activities', activities);
    api.use('/allocations', allocations);
    api.use('/users', users);
    api.use('/jnt', jnt);


    // put init fn here
    // use callback for async fn
    callback()
};