"use strict";

const express = require("express");

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
    });

module.exports = router;

