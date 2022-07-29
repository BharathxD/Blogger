"use strict";

var express = require("express");

var bodyParser = require("body-parser");

var _ = require("lodash");

var ejs = require("ejs");

var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var passport = require("passport");

var session = require("express-session");

var passportLocalMongoose = require("passport-local-mongoose");

var GoogleStrategy = require("passport-google-oauth20").Strategy;

var findOrCreate = require("mongoose-findorcreate");

var flash = require("connect-flash");

var https = require("https");

var _require = require("lodash"),
    result = _require.result,
    functions = _require.functions;

var _require2 = require("console"),
    log = _require2.log;

var posts = [];
var app = express();
var post = mongoose.createConnection("mongodb+srv://Bharath_xD:Saibharat%40123@cluster0.cgaoktp.mongodb.net/blogDB?retryWrites=true&w=majority");
var user = mongoose.createConnection("mongodb+srv://Bharath_xD:Saibharat%40123@cluster0.cgaoktp.mongodb.net/userDB?retryWrites=true&w=majority");
app.set("view engine", "ejs");
app.use(flash());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express["static"]("public"));
app.use(session({
  secret: "Secret",
  resave: false,
  saveUninitialized: false,
  maxAge: 1000 * 60 * 60 * 2 // 2 hours

}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new GoogleStrategy({
  clientID: "160599315944-h6ul8lcq6vb4lhqkl7qv3skmp2r6fhl7.apps.googleusercontent.com",
  clientSecret: "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",
  callbackURL: "http://localhost:3000/auth/google/compose"
}, function (accessToken, refreshToken, profile, cb) {
  User.findOrCreate({
    googleId: profile.id,
    username: profile.displayName
  }, function (err, user) {
    return cb(err, user);
  });
}));
app.use(function (req, res, next) {
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});
app.use(function (req, res, next) {
  if (req.isAuthenticated()) {
    var username = req.user.username;
  } else {
    var username = "";
  }

  res.locals.username = username;
  res.locals.signinStatus = req.isAuthenticated();
  next();
}); // Mongoose Schema for posts

var postSchema = new Schema({
  title: String,
  author: String,
  content: String
}); // Mongoose Schema for user

var userSchema = new Schema({
  email: String,
  password: String,
  googleId: String,
  username: String
});
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
var Post = post.model("Post", postSchema);
var User = user.model("User", userSchema);
passport.use(User.createStrategy());
passport.serializeUser(function (user, done) {
  done(null, user.id);
});
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});
app.get("/auth/google", passport.authenticate("google", {
  scope: ["profile"]
}));
app.get("/auth/google/compose", passport.authenticate("google", {
  failureRedirect: "/login"
}), function (req, res) {
  res.redirect("/compose");
});
app.get("/", function (req, res) {
  Post.find({}, function (err, foundItems) {
    res.render("home", {
      posts: foundItems
    });
  });
});
app.get("/about", function (req, res) {
  res.locals.signinStatus = req.isAuthenticated();
  res.render("about");
});
app.get("/contact", function (req, res) {
  res.render("contact");
});
app.get("/register", function (req, res) {
  if (req.isAuthenticated()) {
    res.redirect("/");
  } else {
    res.render("register");
  }
});
app.get("/login", function (req, res) {
  if (req.isAuthenticated()) {
    res.redirect("/");
  } else {
    req.session.message = {
      type: "danger",
      intro: "Empty Fields",
      message: "Restart"
    };
    res.render("login", {
      signinStatus: req.isAuthenticated()
    });
  }
});
app.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    } else {
      setTimeout(function (err) {
        if (!err) {
          res.redirect("/");
        }

        {
          console.log(err);
        }
      }, 0);
    }
  });
});
app.get("/compose", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("compose");
  } else {
    res.render("login");
  }
});
app.get("/posts/:name", function (req, res) {
  var requestedPostId = req.params.name;
  Post.findById({
    _id: requestedPostId
  }, function (err, foundPost) {
    if (!err) {
      res.render("post", {
        postTitle: foundPost.title,
        postContent: foundPost.content,
        postAuthor: foundPost.author
      });
    } else {
      console.log("err");
    }
  });
});
app.get("/report", function (req, res) {
  if (req.isAuthenticated()) {
    var username = req.user.username;
  }

  res.locals.signinStatus = req.isAuthenticated();
  res.render("report", {
    username: username
  });
});
app.post("/register", function (req, res) {
  User.register({
    username: req.body.username
  }, req.body.password, function (err, user) {
    if (err) {
      req.flash("error", err.message);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function (err) {
        if (!err) {
          res.redirect("/compose");
        } else {
          console.log(err);
        }
      });
    }
  });
});
app.post("/login", function (req, res) {
  var user = new User({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local", {
        successFlash: "Welcome!",
        successRedirect: "/compose",
        failureFlash: true,
        failureRedirect: "/login"
      })(req, res, function (err) {
        if (!err) {
          res.redirect("/compose");
        } else {
          console.log(err);
        }
      });
    }
  });
});
app.post("/compose", function (req, res) {
  var post = new Post({
    title: req.body.inputTitle,
    author: req.user.username,
    content: req.body.textAreaPost
  });
  post.save(function (err) {
    if (!err) {
      res.redirect("/");
    }
  });
});
app.post("/report", function (req, res) {
  var ra = req.body.reportAuthor;
  Post.findOneAndDelete({
    author: req.body.reportAuthor
  }, function (err, post) {
    req.flash("success", "We have recieved your report :D ");
    res.redirect("report");
  });
});
app.listen(process.env.PORT || 3000, function () {
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});