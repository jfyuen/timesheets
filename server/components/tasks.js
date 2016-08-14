"use strict";

const express = require("express"),
    csv = require('express-csv');

var router = express.Router();
var db = require('./db');

router.route('/')
    .delete(function (req, res) {
        var task_ids = req.body.task_ids;
        db.deleteTasks(task_ids, function (err, results) {
            if (err) {
                res.status(500).json(err);
            } else {
                res.status(200).json('ok');
            }
        });
    })
    .get(function (req, res) {
        db.getAllTasks(function (err, results) {
            if (err) {
                res.status(500).json(err);
            } else {
                var headers = {};
                for (var key in results[0]) {
                    headers[key] = key;
                }
                results.unshift(headers);
                res.set('Content-Type', 'text/csv; charset=utf-8');
                res.set('Content-Disposition', 'attachment; filename=tasks.csv');

                res.status(200).csv(results);
            }
        });
    });

module.exports = router;

