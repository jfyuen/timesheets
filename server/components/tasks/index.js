"use strict";

const express = require("express");

var router = express.Router();

router.route('/')
    .post()
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

router.route('/:id')
    .put()
    .delete()
    .get();

module.exports = router



