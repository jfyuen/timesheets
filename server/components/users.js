"use strict";

const express = require("express");

var router = express.Router();

router.route('/')
    .post()
    .get(function (req, res) {
        res.status(200).json([
            {id: 0, name: 'JFY'},
            {id: 1, name: 'PCN'},
            {id: 2, name: 'BDS'}
        ]);
    });

router.route('/:id')
    .put()
    .delete()
    .get();

module.exports = router;



