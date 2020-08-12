/*
  File name: users.js
  Author: Meisam Koohaki
  web site name: Jikiki
  file description: js for the project web application (Assignment-2)
*/

'use strict';
var express = require('express');
var router = express.Router();
var userModel = require('../models/user');
var itemModel = require('../models/item');

router.get('/', function (req, res) {

    if (req.isAuthenticated()) {   
        userModel.find({}, function (err, users) {
            if (err) console.log(err);
            itemModel.find({}, function (err, items) {
             
                if (err) console.log('Something in fetching went wrong!');
                res.render("personal", { users: users, user: req.user, items: items });
            });
        });
    } else {
        res.redirect('/home')
    }
});

module.exports = router;