"use strict";

const express = require("express");
var categories = require('./categories'),
    projects = require('./projects'),
    activities = require('./activities'),
    allocations = require('./allocations'),
    users = require('./users'),
    jnt = require('./jnt'),
    tasks = require('./tasks');

function nocache(req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
}

module.exports.init = function (app, callback) {
    app.use('/categories', nocache, categories);
    app.use('/projects', nocache, projects);
    app.use('/activities', nocache, activities);
    app.use('/allocations', nocache, allocations);
    app.use('/users', nocache, users);
    app.use('/jnt', nocache, jnt),
    app.use('/tasks', nocache, tasks);

    callback()
};