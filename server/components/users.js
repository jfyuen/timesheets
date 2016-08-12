"use strict";

const express = require("express");

var router = express.Router();
var db = require('./db');

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

router.route('/:id/tasks')
    .put()
    .get(function (req, res) {
        var id = req.params['id'];
        db.getUserTasks(id, function (err, results) {
            if (err) {
                res.status(500).json(err);
            } else {
                var content = {}
                for (var i = 0; i < results.length; i++) {
                    var task = results[i];
                    if (!(task.date in content)) {
                        content[task.date] = [];
                    }
                    content[task.date].push(task);
                }
                res.status(200).json(content);
            }
        });
    });



module.exports = router;



