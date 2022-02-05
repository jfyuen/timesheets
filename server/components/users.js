const express = require("express");

const router = express.Router();
const db = require('./db');

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
    .post(function (req, res) {
        const id = parseInt(req.params['id']);
        const activity_id = req.body.activity_id,
            allocation_id = req.body.allocation_id,
            comment = req.body.comment,
            day = req.body.date;
        db.addTask(id, activity_id, allocation_id, day, comment, function (err, results) {
            if (err) {
                res.status(500).json(err);
            } else {
                res.status(200).json(results);
            }
        });
    })
    .get(function (req, res) {
        const id = parseInt(req.params['id']);
        db.getUserTasks(id, function (err, results) {
            if (err) {
                res.status(500).json(err);
            } else {
                res.status(200).json(results);
            }
        });
    });



module.exports = router;



