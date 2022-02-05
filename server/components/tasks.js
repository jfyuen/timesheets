const express = require("express"),
    csv = require('express-csv');

const router = express.Router();
const db = require('./db');

router.route('/:ids')
    .delete(function (req, res) {
        const ids = req.params['ids'].split(',');
        const task_ids = [];
        for (let i = 0; i < ids.length; i++) {
            task_ids.push(parseInt(ids[i]));
        }
        db.deleteTasks(task_ids, function (err, results) {
            if (err) {
                console.error("cannot delete tasks", err);
                res.status(500).json(err);
            } else {
                res.status(200).json('ok');
            }
        });
    });

router.route('/')
    .get(function (req, res) {
        db.getAllTasks(function (err, results) {
            if (err) {
                console.error("cannot download tasks:", err);
                res.status(500).json(err);
            } else {
                const headers = {};
                for (const key in results[0]) {
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

