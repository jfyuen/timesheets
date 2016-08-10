"use strict";

const express = require("express");

var router = express.Router();
var db = require('./db');

var TASKS = {
    '0': {
        '2016-07-25': [{ id: 0, activity: { id: 0, name: 'Activity 1' }, project: { id: 0, name: 'Project A' }, allocation: { id: 0, name: '1', value: 1 }, date: '2016-07-25' }],
        '2016-07-28': [
            { id: 1, activity: { id: 0, name: 'Activity 1' }, project: { id: 0, name: 'Project A' }, allocation: { id: 0, name: '1', value: 1 }, date: '2016-07-28' },
            { id: 2, activity: { id: 0, name: 'Activity 2' }, project: { id: 0, name: 'Project b' }, allocation: { id: 2, name: '1/2', value: 0.5 }, date: '2016-07-28' }
        ]
    }
};


router.route('/')
    .post()
    .get(function (req, res) {
        db.getUsers(function (err, results) {
            if (err) {
                res.status(500).json(err);
            } else {
                res.status(200).json(results);
            }
        });
    });

router.route('/:id')
    .put()
    .delete()
    .get();

router.route('/:id/tasks')
    .put()
    .get(function (req, res) {
        var id = req.params['id'];
        if (!(id in TASKS)) {
            res.status(404).json({ error: 'user id not found: ' + id });
            return;
        }
        res.status(200).json(TASKS[id]);
    });


module.exports = router;



