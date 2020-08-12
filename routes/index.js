'use strict';
var express = require('express');
var router = express.Router();
var passport = require('passport');
var userModel = require('../models/user');
var itemModel = require('../models/item');
var bcrypt = require('bcryptjs');
var multer = require('multer');
var fs = require('fs');
var path = require('path')
var nodemailer = require('nodemailer');
var session = require('express-session');
var cookieSession = require('cookie-session');

/* GET index page. */
router.get('/', function (req, res) {
    res.render('index', { user: req.user, title: 'Index' });
});

/* GET home page. */
router.get('/home', function (req, res, next) {
    itemModel.find({}, function (err, items) {
        if (err) {
            res.send('Something in fetching went wrong!');
            next()
        } else {
            res.render("home", { user: req.user, items: items, item: req.item });
        }
    });
});


/*POST for login*/
//Try to login with passport  - It uses authenticat checking to avoid getting/display page withought logging in */
router.post('/login', passport.authenticate('local', {
    successRedirect: '/users',
    failureRedirect: '/home',
    failureMessage: 'Invalid Login'
}));

/*GET for Logout*/
router.get('/logout', function (req, res) {

    req.session.destroy();
    res.redirect('/home');
});

/*GET for register in signup page*/
router.get('/signup', function (req, res) {
    res.render('signup');
});

/*POST for register - It uses authenticat checking to avoid posting withought logging in */
router.post('/signup', function (req, res) {
    //Insert user
    bcrypt.hash(req.body.password, 10, function (err, hash) {
        var registerUser = {
            username: req.body.username,
            password: hash,
            email: req.body.email
        }
        //Check if user already exists
        userModel.find({ username: registerUser.username }, function (err, username) {
            if (err) console.log(err);
            userModel.find({ email: registerUser.email }, function (err, email) {
                if (err) console.log(err);
                if (req.body.username && req.body.password && req.body.repassword &&
                    req.body.email && req.body.password == req.body.repassword) {

                    if (!username.length && !email.length) {
                        const newUser = new userModel(registerUser);
                        newUser.save(function (err) {
                            if (err) console.log(err);
                            res.redirect('/home');
                        });
                    } else {
                        res.render('signup', { message: 'Username or email already exist, please try again.' });
                    }
                } else if (req.body.password != req.body.repassword) {
                    res.render('signup', { message: 'Password and repassword are not match.' });
                } else { //never get this because of the form requirements
                    res.render('signup', { message: 'There is at least a field which is not filled out.' });
                }
            });
        });
    });
});

//Creating the file name and destination directory when called
var storage = multer.diskStorage({
    destination: function (req, file, cb) {

        cb(null, './public/imageStorage')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '.png')
    }
});

//Creating uploader
var upload = multer({ storage: storage });

/*post for submit the item info/image in database and image in local folder - It uses authenticat checking to avoid posting withought logging in */
router.post('/submit', upload.single('image'), function Create(req, res) {
    if (req.isAuthenticated()) {
        if (req.body.name && req.body.description && req.body.price) {

            var registerItem = new itemModel();
            registerItem.name = req.body.name;
            registerItem.description = req.body.description;
            registerItem.price = req.body.price;

            // Checking for submition with/withought image - It is avoiding errors
            if (req.file !== undefined) {

                registerItem.image.data = fs.readFileSync(path.join('./public/imageStorage/' + req.file.filename));
                registerItem.image.contenttype = 'image/png';
                registerItem.imageName = req.file.filename;

            } else {

                registerItem.image.data = null;
                registerItem.image.contenttype = '';
                registerItem.imageName = null;
            }

            registerItem.save(function (err) {
                if (err) console.log(err);

                res.redirect('/personal');
            });

        } else {
            console.log('---------------------some fields are not completed---------------------');
            res.redirect('/personal');
        }
    } else {
        res.redirect('/')
    }
});

/* GET show page - It uses authenticat checking to avoid getting/display page withought logging in */
router.get('/show/:id', function (req, res) {
    if (req.isAuthenticated()) {
        var itemId = req.params.id;

        itemModel.findById(itemId, function (err, foundItem) {
            if (err) console.log(err);
            //Render show page with specific article
            res.render('show', { title: 'Show', user: req.user, item: foundItem });
        });
    } else {
        res.redirect('/')
    }
});

/* POST update in show page - It uses authenticat checking to avoid posting withought logging in */
router.post('/update', upload.single('image'), function Create(req, res) {
    if (req.isAuthenticated()) {
        if (req.body.name && req.body.description && req.body.price) {

            //Now I found what our instructor said in HTML course, what the value is for in fomrs!
            var newName = req.body.name;
            var newDescription = req.body.description;
            var newPrice = req.body.price;
            var newImageData = req.body.iamge;
            var newImageContent = 'image/png';
            var newImageName = req.body.imageName;
            var itemId = req.body.id
            var picture = req.body.deletePic

            // Checking for submition if the new item is with image - It is avoiding errors
            if (req.file !== undefined) {

                newImageData = fs.readFileSync(path.join('./public/imageStorage/' + req.file.filename));
                newImageContent = 'image/png';
                newImageName = req.file.filename;

                //Remove the local image in imageStorage if user check the delete image
                itemModel.findById(itemId, function (err, foundItem) {
                    if (err) console.log(err);

                    //Remove the local image (from imageStorage folder)
                    fs.unlink(path.join('./public/imageStorage/' + foundItem.imageName), function (err) {
                        if (err) console.log(err);
                    });
                });

                itemModel.findOneAndUpdate({ _id: itemId }, {
                    name: newName, description: newDescription, price: newPrice,
                    image: { data: newImageData, contenttype: newImageContent },
                    imageName: newImageName
                }, function (err, model) {
                    if (err) console.log(err);
                    res.redirect('/personal');
                });

              // New item is withought image - It is avoiding errors
            } else {
                itemModel.findById({ _id: itemId }, function (err, foundItem) {
                    if (err) console.log(err);
                    if (foundItem !== null && picture != 'on') {

                        newImageData = foundItem.image.data;
                        newImageContent = foundItem.image.contenttype;
                        newImageName = foundItem.imageName;

                    } else if (foundItem !== null && picture == 'on') {
                        //Remove the local image in imageStorage
                        itemModel.findById(itemId, function (err, foundItem) {
                            if (err) console.log(err);

                            //Remove the local image in imageStorage
                            fs.unlink(path.join('./public/imageStorage/' + foundItem.imageName), function (err) {
                                if (err) console.log(err);
                            });
                        });

                        newImageData = null;
                        newImageContent = null;
                        newImageName = null;

                    } else {

                        newImageData = null;
                        newImageContent = null;
                        newImageName = null;
                    }

                    itemModel.findOneAndUpdate({ _id: itemId }, {
                        name: newName, description: newDescription, price: newPrice,
                        image: { data: newImageData, contenttype: newImageContent },
                        imageName: newImageName
                    }, function (err, model) {

                        if (err) console.log(err);
                        res.redirect('/personal');
                    });
                });
            }
        } else {
            itemModel.findById(req.body.id, function (err, foundItem) {
                if (err) console.log(err);
                //Render show page with specific article
                res.render('show', { title: 'Show', user: req.user, item: foundItem, message: 'All Name, Price, and Description fields must be filled out' });
            });
        }
    } else {
        res.redirect('/')
    }
});

/* POST delete in show and personal pages - It uses authenticat checking to avoid posting withought logging in */
router.post('/delete/:id', (function (req, res) {
    if (req.isAuthenticated()) {
        var itemId = req.params.id;

        try {
            itemModel.findById({ _id: itemId }, function (err, foundItem) {

                if (err) console.log(err);
                // This condition avoid error when the item does not contain image
                if (foundItem.imageName) {
                    //Remove the local image in imageStorage
                    fs.unlink(path.join('./public/imageStorage/' + foundItem.imageName), function (err) {
                        if (err) console.log(err);
                    });
                } else {
                    console.log('---------------------Item does not contain picture---------------------');
                }

                itemModel.findByIdAndDelete(itemId, function (err, result) {
                    if (err) console.log(err);
                    res.redirect('/personal');
                });
            });

        } catch (err) {
            console.log(err);
            res.redirect('/personal');
        }
    } else {
        res.redirect('/')
    }
}));

/* GET personal page - It uses authenticat checking to avoid from showing the page withought logging in */
router.get('/personal', function (req, res) {
    if (req.isAuthenticated()) {
        userModel.find({}, function (err, users) {
            if (err) console.log(err);
            itemModel.find({}, function (err, items) {

                if (err) console.log('---------------------Something in fetching went wrong!---------------------');
                res.render("personal", { user: req.user, items: items });
            });
        });
    } else {
        res.redirect('/')
    }
});

/* GET retrieving page. */
router.get('/retrieving', function (req, res) {
    res.render('retrieving', { title: 'Retrieving' });
});

/* Post retrieving username in retrieving page - If user provide correct information it will send the username to the email */
router.post('/retrieving_username', function (req, res) {

    var passwordTry = req.body.password;
    var emailTry = req.body.email;

    userModel.findOne({ email: emailTry }, function (err, user) {
        if (user) {
            if (bcrypt.compare(passwordTry, user.password, function (err, isMatch) {
                if (isMatch) {

                    const output = `
                    <p>USERNAME RETRIEVING</p>
                    <h3>This email sent you because of your request for retrieving your username in JIKIKI</h3>
                    <ul>  
                        <li>Username: ${user.username}</li>
                    </ul>
                    `;

                    // create reusable transporter object using the default SMTP transport / I have an account in Hostinger, then I used that.
                    let transporter = nodemailer.createTransport({
                        host: 'smtp.hostinger.com',
                        port: 587,
                        secure: false,
                        auth: {
                            user: 'mkoohaki.online@mkoohaki.online', // generated ethereal user
                            pass: 'hostMK64656465'  // generated ethereal password
                        },
                        tls: {
                            rejectUnauthorized: true
                        }
                    });

                    // setup email data with unicode symbols
                    let mailOptions = {
                        from: '"JIKIKI web application" <mkoohaki.online@mkoohaki.online>', // sender address
                        to: user.email, // email of receiver
                        subject: 'Retrieving Password on JIKIKI', // Subject line
                        text: 'Hello world?', // plain text body
                        html: output // html body
                    };

                    // send mail with defined transport object
                    transporter.sendMail(mailOptions, (err, info) => {
                        if (err) {
                            return console.log(err);
                        }
                        //I created render to show the messages, it was working well, but after creating google acount(or something else) it cannot render anymore
                        res.redirect('/home');
                    });
                } else {
                    res.redirect('/retrieving');
                }
            }));
        } else {
            res.redirect('/retrieving');
        }
    });
});


/* Post delete account in retrieving page _ automatically brings user to the signup page */
router.post('/delete_account', function (req, res) {
    var usernameTry = req.body.username;
    var emailTry = req.body.email;

    userModel.findOne({ username: usernameTry, email: emailTry }, function (err, user) {
        if (user) {
            var uid = user.id.toString();
            userModel.deleteOne({ _id: uid }, function (err, result) {
                if (err) Console.log(err);
                res.render('signup', { message: 'Account successfully deleted' });
            });
        } else {
            res.render('retrieving', { message: 'username or email is wrong' });
        }
    });
});

/*Get for login with google*/
//Try to login with passport(google)
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }), function (req, res) {
});

router.get('/google/callback', passport.authenticate('google', {
    successRedirect: '/users',
    failureRedirect: '/home',
    failureMessage: 'Invalid Login'
}));

module.exports = router;
