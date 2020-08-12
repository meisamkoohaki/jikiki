/*
  File name: user.js
  Author: Meisam Koohaki
  web site name: Jikiki
  file description: js for the project web application (Assignment-2)
*/

const mongoose = require('mongoose');

//Create the user schema
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }, 
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    }
});

//Create, instantiate and export model with schema
const Users = mongoose.model("User", UserSchema);
module.exports = Users;
