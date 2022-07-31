"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const flash = require("connect-flash");
const port = process.env.PORT || 3000;
const app = express();
require('dotenv').config();

/* Importing Routes */

const home = require("./routes/home.js");
const about = require("./routes/about.js");
const contact = require("./routes/contact.js");
const myposts = require("./routes/userPosts.js");
const compose = require("./routes/compose.js");
const report = require("./routes/report.js");
const posts = require("./routes/posts.js");
const deletePost = require("./routes/deletePost.js");
const login = require("./routes/login.js");
const register = require("./routes/register.js");
const googleAuth = require("./routes/googleAuth.js");
const User = require("./models/user_model");

/* ------------------- */

app.set("view engine", "ejs");
app.use(flash());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(
  session({
    secret: "Secret",
    resave: false,
    saveUninitialized: false,
    maxAge: 1000 * 60 * 60 * 2, // 2 hours
  })
);

/* PassportJS Middleware */

app.use(passport.initialize());
app.use(passport.session());
passport.use(
  new GoogleStrategy(
    {
      clientID:
        process.env.CLIENT_ID,
      clientSecret: 
        process.env.CLIENT_SECRET,
      callbackURL: 
        "https://blogger-by-bharath.herokuapp.com/auth/google/compose",
    },
    (accessToken, refreshToken, profile, cb) => {
      User.findOrCreate(
        { 
          googleId: profile.id, 
          username: profile.displayName 
        },
        (err, user) => {
          return cb(err, user);
        }
      );
    }
  )
);

passport.use(User.createStrategy());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

/* flash middleware */

app.use((req, res, next) => {
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

/* Error handling middleware */

app.use((err, req, res, next) => {
  logError(err);
  if (err.statusCode) {
    res.status(err.statusCode).send({ error: err.message });
  } else {
    res.status(500).send({ error: "Something went wrong" });
  }
});

/* Nav elements intialization */

app.use((req, res, next) => {
  if (req.isAuthenticated()) {
    res.locals.username = req.user.username;
  } else {
    res.locals.username = "";
  }
  res.locals.signinStatus = req.isAuthenticated();
  next();
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

/* Server running on port 3000 */

let http = require("http");
let server = express().use("/", app);
http.createServer(server).listen(port, () => {
  console.log("Listening on " + port);
});
