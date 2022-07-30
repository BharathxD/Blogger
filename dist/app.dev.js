"use strict";

var express = require("express");

var bodyParser = require("body-parser");

var ejs = require("ejs");

var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var passport = require("passport");

var session = require("express-session");

var passportLocalMongoose = require("passport-local-mongoose");

var GoogleStrategy = require("passport-google-oauth20").Strategy;

var findOrCreate = require("mongoose-findorcreate");

var flash = require("connect-flash");

var port = process.env.PORT || 3000;
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
    res.locals.username = req.user.username;
  } else {
    res.locals.username = "";
  }

  res.locals.signinStatus = req.isAuthenticated();
  next();
}); // Mongoose Schema for posts

var postSchema = new Schema({
  title: String,
  author: String,
  content: String,
  timestamp: String
}); // Mongoose Schema for user

var userSchema = new Schema({
  email: String,
  password: String,
  googleId: String,
  username: String,
  posts: [postSchema]
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
app.get("/myposts", function (req, res) {
  User.findById({
    _id: req.user._id
  }, function (err, foundUser) {
    var storeFoundUser = foundUser.posts;

    if (!err) {
      res.render("userPosts", {
        posts: storeFoundUser
      });
    } else {
      console.log(err);
    }
  });
});
/* Register Route */

app.route("/register").get(function (req, res) {
  // GET
  if (req.isAuthenticated()) {
    res.redirect("/");
  } else {
    res.render("register");
  }
}).post(function (req, res) {
  // POST
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
/* Login Route */

app.route("/login").get(function (req, res) {
  // GET
  if (req.isAuthenticated()) {
    res.redirect("/");
  } else {
    req.session.message = {
      type: "danger",
      intro: "Empty Fields",
      message: "Restart"
    };
    res.render("login");
  }
}).post(function (req, res) {
  // POST
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
/* Compose Route */

app.route("/compose").get(function (req, res) {
  // GET
  if (req.isAuthenticated()) {
    res.render("compose");
  } else {
    res.render("login");
  }
}).post(function (req, res) {
  // POST 
  User.findById(req.user.id, function (err, foundUser) {
    if (err) {
      console.log(err);
      res.redirect("/compose");
    } else {
      var currentDate = new Date();
      var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      var date = currentDate.getDate() + "th " + monthNames[currentDate.getMonth()] + " " + currentDate.getFullYear();

      var _post = new Post({
        title: req.body.inputTitle,
        author: req.user.username,
        content: req.body.textAreaPost,
        timestamp: date
      });

      foundUser.posts.push(_post);
      foundUser.save();

      _post.save(function (err) {
        if (!err) {
          res.redirect("/");
        }
      });
    }
  });
});
/* Report Route */

app.route("/report").get(function (req, res) {
  // GET
  res.render("report");
}).post(function (req, res) {
  // POST 
  Post.findOneAndDelete({
    author: req.body.reportAuthor
  }, function (err, post) {
    req.flash("success", "We have recieved your report :D ");
    res.redirect("report");
  });
});
app.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    } else {
      res.redirect("/");
    }
  });
});
app.get("/posts/:name", function (req, res) {
  Post.findById({
    _id: req.params.name
  }, function (err, foundPost) {
    if (!err) {
      res.render("post", {
        postTitle: foundPost.title,
        postContent: foundPost.content,
        postAuthor: foundPost.author,
        postTime: foundPost.timestamp
      });
    } else {
      console.log(err);
    }
  });
});
app.listen(port, function () {
  console.log("Express server started");
});