"use strict";

const express = require("express");

var router = express.Router();

router.route('/')
    .post()
    .get(function (req, res) {
        res.status(200).json([
            {id: 0, name: 'Project 1'},
            {id: 1, name: 'Project 2'},
            {id: 2, name: 'Project 3'}
        ]);
    });

router.route('/:id')
    .put()
    .delete()
    .get();

module.exports = router;

