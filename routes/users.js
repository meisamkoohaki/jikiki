'use strict';
var express = require('express');
var router = express.Router();
var userModel = require('../models/user');
var itemModel = require('../models/item');
var userGoogleModel = require('../models/user-google');

router.get('/', function (req, res) {

    if (req.isAuthenticated()) {   
        userModel.find({}, function (err, users) {
            if (err) console.log(err);
            if (users) {
                itemModel.find({}, function (err, items) {

                    if (err) console.log('Something in fetching went wrong!');
                    res.render("personal", { users: users, user: req.user, items: items });
                });
            } else {
                userGoogleModel.find(_id, function (err, users) {
                    if (err) console.log(err);
                    console.log('9999999999999');
                    itemModel.find({}, function (err, items) {

                        if (err) console.log('Something in fetching went wrong!');
                        res.render("personal", { users: users, user: req.user, items: items });
                    });
                })
            }
        });
    } else {
        console.log('88888888888888888888888888');
        res.redirect('/home')
    }
});

module.exports = router;