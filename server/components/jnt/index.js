"use strict";

const express = require("express");

var router = express.Router();

router.route('/')
    .post()
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
        ]);
    })

router.route('/:id')
    .put()
    .delete()
    .get();

module.exports = router



