"use strict";

const express = require("express");

var router = express.Router();

router.route('/')
    .post()
    .get(function (req, res) {
        res.status(200).json([
            {id: 0, name: '1', value: 1},
            {id: 1, name: '3/4', value: 0.75},
            {id: 2, name: '1/2', value: 0.5},
            {id: 3, name: '1/4', value: 0.25}
        ]);
    })

router.route('/:id')
    .put()
    .delete()
    .get();

module.exports = router



