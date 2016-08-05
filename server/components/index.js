"use strict";

const express = require("express");

var projects = require('./projects'),
    tasks = require('./tasks'),
    activities = require('./activities'),
    allocations = require('./allocations'),
    users = require('./users'),
    jnt = require('./jnt');

module.exports.init = function (app, callback) {
    app.use('/projects', projects);
    app.use('/tasks', tasks);
    app.use('/activities', activities);
    app.use('/allocations', allocations);
    app.use('/users', users);
    app.use('/jnt', jnt);

    callback()
};