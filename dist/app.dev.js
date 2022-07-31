'use strict';

var express = require('express');

var bodyParser = require('body-parser');

var passport = require('passport');

var session = require('express-session');

var GoogleStrategy = require('passport-google-oauth20').Strategy;

var flash = require('connect-flash');

var port = process.env.PORT || 3000;
var app = express();
/* Importing Routes */

var home = require('./routes/home.js');

var about = require('./routes/about.js');

var contact = require('./routes/contact.js');

var myposts = require('./routes/userPosts.js');

var compose = require('./routes/compose.js');

var report = require('./routes/report.js');

var posts = require('./routes/posts.js');

var deletePost = require('./routes/deletePost.js');

var login = require('./routes/login.js');

var register = require('./routes/register.js');

var googleAuth = require('./routes/googleAuth.js');

var User = require('./models/user_model');

app.set('view engine', 'ejs');
app.use(flash());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express["static"]('public'));
app.use(session({
  secret: 'Secret',
  resave: false,
  saveUninitialized: false,
  maxAge: 1000 * 60 * 60 * 2 // 2 hours

}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new GoogleStrategy({
  clientID: '160599315944-h6ul8lcq6vb4lhqkl7qv3skmp2r6fhl7.apps.googleusercontent.com',
  clientSecret: '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',
  callbackURL: 'http://localhost:3000/auth/google/compose'
}, function (accessToken, refreshToken, profile, cb) {
  User.findOrCreate({
    googleId: profile.id,
    username: profile.displayName
  }, function (err, user) {
    return cb(err, user);
  });
}));
app.use(function (req, res, next) {
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  next();
});
app.use(function (req, res, next) {
  if (req.isAuthenticated()) {
    res.locals.username = req.user.username;
  } else {
    res.locals.username = '';
  }

  res.locals.signinStatus = req.isAuthenticated();
  next();
});
passport.use(User.createStrategy());
passport.serializeUser(function (user, done) {
  done(null, user.id);
});
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});
/* Google Authenticator */

app.use(googleAuth);
/* Home Route */

app.use(home);
/* About Route */

app.use(about);
/* Contact Route */

app.use(contact);
/* Route to show users what they've posted */

app.use(myposts);
/* Compose Route */

app.use(compose);
/* Report Route */

app.use(report);
/* Route for navigating to individual posts */

app.use(posts);
/* Route to delete an existing post from the Post schema database */

app.use(deletePost);
/* Register Route */

app.use(register);
/* Login Route */

app.use(login);
/* Server */

var http = require("http");

var server = express().use('/', app);
http.createServer(server).listen(port, function () {
  console.log('Listening on ' + port);
});