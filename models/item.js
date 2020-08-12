/*
  File name: item.js
  Author: Meisam Koohaki
  web site name: Jikiki
  file description: js for the project web application (Assignment-2)
*/

const mongoose = require('mongoose');

//Create the user schema
const ItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        max: 64
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: String,
        required: true
    },
    image: {
        data: Buffer,
        contentType: String
    },
    imageName: {
        type: String
    }
});

//Create, instantiate and export model with schema
const Items = mongoose.model("Item", ItemSchema);
module.exports = Items;
