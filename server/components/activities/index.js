"use strict";

const express = require("express");

var router = express.Router();

router.route('/')
    .post()
    .get(function (req, res) {
        res.status(200).json([
            {id: 0, name: 'Activity 1'},
            {id: 1, name: 'Activity 2'},
            {id: 2, name: 'Activity 3'}
        ]);
    });

router.route('/:id')
    .put()
    .delete()
    .get();

module.exports = router;



