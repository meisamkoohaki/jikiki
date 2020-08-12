/*
  File name: app.js
  Author: Meisam Koohaki
  web site name: Jikiki
  file description: js for the project web application (Assignment-2)
*/

'use strict';
var debug = require('debug');
var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcryptjs');
var mongoose = require('mongoose');
var cookieSession = require('cookie-session');

const uri = "mongodb+srv://meisam:6465@cluster0-qjiac.mongodb.net/jikiki_login";
try {
    mongoose.connect(uri, { iseNewUrlParser: true });
    var db = mongoose.connection;
    db.on('error', function (err) {
        console.log(err);
    });
    db.once('open', function (callback) {

        //const collection = client.db("test").collection("devices");
        console.log("Connected");
        console.log("-----------------------------------------");
        //console.log(collection);
    });
} catch (err) {
    console.log("Error : " + err);
}



var routes = require('./routes/index');
var users = require('./routes/users');
var userModel = require('./models/user');
var userGoogleModel = require('./models/user-google');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'secrettexthere',
    saveUninitialized: true,
    resave: true
}));


//Init passport auth
app.use(passport.initialize());
app.use(passport.session());
app.use('/', routes);
app.use('/users', users);


//Serialize user
passport.serializeUser(function (user, done) {
    done(null, user.id)
});

//deserialize user try to find username
passport.deserializeUser(function (id, done) {
    userModel.findById(id, function (err, user) {
        done(err, user);
    });
});



/*
    I created this but did not finished because it was extra work (I sent you an email) and also I did not have time :-)
    It can get account info from Google and read it (you can see in console, if user exist pass the authenticaion, if not
    create an account for user and save needed information on the database, but it cannot open the page
*/

//deserialize user try to find username

//passport.deserializeUser(function (obj, done) {
//    switch (obj.type) {
//        case 'user':
//            userModel.findById(obj.id, function (err, user) {
//                if (!err) {
//                    done(null, user);
//                } else {
//                    console.log('Err1: ', err)
//                }
//            });
//            break;
//        case 'google':
//            userGoogleModel.findById(obj.id, function (err, google) {
//                if (!err) {
//                    done(null, google);
//                } else {
//                    console.log('Err2: ', err)
//                }
//            });
//            break;
//        default:
//            done(err, null);
//            break;
//    }
//});


/*
    I created this but did not finished because it was extra work (I sent you an email) and also I did not have time :-)
    It can get account info from Google and read it (you can see in console, if user exist pass the authenticaion, if not
    create an account for user and save needed information on the database, but it cannot open the page
*/

//Local strategy used for logging users
passport.use(new LocalStrategy(
    function (username, password, done) {
        userModel.findOne({
            username: username
        }, function (err, user) {
            if (err) {
                return done(err);
            }

            if (!user) {
                return done(null, false);
            }

            //Compare hashed passwords
            if (!bcrypt.compareSync(password, user.password)) {
                return done(null, false);
            }

            return done(null, user);
        });
    }
));

/*
    I created this but did not finished because it was extra work (I sent you an email) and also I did not have time :-)
    It can get account info from Google and read it (you can see in console, if user exist pass the authenticaion, if not
    create an account for user and save needed information on the database, but it cannot open the page
*/

//Startegy for google accounts
passport.use(new GoogleStrategy({
    clientID: '666388657629-op2tb225or4co9o4cas8adarkpee28be.apps.googleusercontent.com',
    clientSecret: 'LAial6nMu9TuZkKwYNR-omTE',
    callbackURL: "http://localhost:1337/google/callback"
},
    function (accessToken, refreshToken, profile, done) {
        console.log(profile);

        var emailArray = new Array();

        profile.emails.forEach((email) => {
            emailArray.push(email.value);
        })

        userGoogleModel.findOne({ $or: [{ oauthID: profile.id }, { email: { $in: emailArray } }] }, function (err, user) {
            if (err) {
                return console.log(err);
            }
            if (!err && user !== null) {
                console.log('Already existing user:' + user);
                return done(null, profile);

            } else {
                console.log('Creating a new user');
                //const newUser = new userGoogleModel(registerUser);
                const user = new userGoogleModel({

                    username: profile.name.givenName,
                    oauthID: profile.id,
                    email: emailArray[0]
                });
                user.save(function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        done(null, user);
                    }
                });
            }
            return done(null, profile);
        });
    }
));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function () {
    debug('Express server listening on port ' + server.address().port);
});

