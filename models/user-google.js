/*
  File name: user-google.js
  Author: Meisam Koohaki
  web site name: Jikiki
  file description: js for the project web application (Assignment-2)
*/

/*
    I created this but did not finished because it was extra work and also I did not have time :-)
    It can get account info from Google and read it (you can see in console, if user exist pass the authenticaion, if not
    create an account for user and save needed information on the database, but it cannot open the page
*/

const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

//Create the google user schema
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    oauthID: {
        type: Number,
        required: true,
        unique: true
    }, 
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    }
});

UserSchema.plugin(passportLocalMongoose);

//Create, instantiate and export model with schema
const UsersGoogle = mongoose.model("UserGoogle", UserSchema);
module.exports = UsersGoogle;
