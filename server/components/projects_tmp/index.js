"use strict";

const express = require("express");

var router = express.Router();

router.route('/')
    .post()
    .get(function (req, res) {
        res.status(200).json([
            {id: 0, name: 'Project A'},
            {id: 1, name: 'Project B'},
            {id: 2, name: 'Project C'}
        ])
    });

router.route('/:id')
    .put()
    .delete()
    .get();

module.exports = router



