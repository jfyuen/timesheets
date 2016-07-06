"use strict";

const express = require("express");

var api = express.Router();

api.route('/projects')
    .get(function (req, res) {
        res.status(200).json([
            {id: 0, name: 'Project A'},
            {id: 1, name: 'Project B'},
            {id: 2, name: 'Project C'}
        ])
    });

api.route('/activities')
    .get(function (req, res) {
        res.status(200).json([
            {id: 0, name: 'Activity 1'},
            {id: 1, name: 'Activity 2'},
            {id: 2, name: 'Activity 3'}
        ])
    });

api.route('/allocations')
    .get(function (req, res) {
        res.status(200).json([
            {id: 0, name: '1', value: 1},
            {id: 1, name: '3/4', value: 0.75},
            {id: 2, name: '1/2', value: 0.5},
            {id: 3, name: '1/4', value: 0.25}
        ])
    });

api.route('/users')
    .get(function (req, res) {
        res.status(200).json([
            {id: 0, name: 'JFY'},
            {id: 1, name: 'PCN'},
            {id: 2, name: 'BDS'}
        ])
    });

api.route('/jnt')
    .get(function (req, res) {
        res.status(200).json([
            '2016-01-29',
            '2016-02-26',
            '2016-03-25',
            '2016-04-15',
            '2016-05-06',
            '2016-07-15',
            '2016-08-26',
            '2016-10-31',
            '2016-12-26',
            '2016-12-27'
        ])
    });

api.route('/tasks')
    .delete(function (req, res) {
        console.log('console.log TODO delete tasks');
        res.sendStatus(500)
    })
    .post(function (req, res) {
        console.log('console.log TODO post tasks');
        res.sendStatus(500)
    })
    .get(function (req, res) {
        res.status(200).json({
            '2016-07-04': [
                {
                    id: 0,
                    activity: {id: 0, name: 'Activity 1'},
                    project: {id: 0, name: 'Project A'},
                    allocation: {id: 0, name: '1', value: 1},
                    date: '2016-07-04'
                }
            ],
            '2016-07-05': [
                {
                    id: 0,
                    activity: {id: 0, name: 'Activity 1'},
                    project: {id: 0, name: 'Project A'},
                    allocation: {id: 0, name: '1', value: 1},
                    date: '2016-07-05'
                }, {
                    id: 0,
                    activity: {id: 0, name: 'Activity 2'},
                    project: {id: 0, name: 'Project b'},
                    allocation: {id: 2, name: '1/2', value: 0.5},
                    date: '2016-07-05'
                }
            ]
        })
    });


module.exports = function (app) {
    app.use('/api', api)
};