const express = require("express");

const router = express.Router();
const db = require('./db');

router.route('/')
    .post()
    .get(function (req, res) {
        db.getAllocations(function (err, results) {
            if (err) {
                console.error("cannot get allocations:", err);
                res.status(500).json(err);
            } else {
                res.status(200).json(results);
            }
        });
    });

module.exports = router



