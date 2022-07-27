const express = require("express");
const bodyParser = require("body-parser");
var _ = require("lodash");
const ejs = require("ejs");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passport = require("passport");
const session = require("express-session");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");
const https = require("https");
const { result, functions } = require("lodash");
const { log } = require("console");
require("dotenv").config();
const posts = [];

const app = express();

var post = mongoose.createConnection("mongodb://localhost:27017/blogDB");
var user = mongoose.createConnection("mongodb://localhost:27017/userDB");

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(session({ secret: "Secret", resave: false, saveUninitialized: false, maxAge: 5000 }));
app.use(passport.initialize());
app.use(passport.session());
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/compose",
    },
    function (accessToken, refreshToken, profile, cb) {
      User.findOrCreate(
        { googleId: profile.id, username: profile.displayName },
        function (err, user) {
          console.log("ID: " + profile.id);
          console.log("Name: " + profile.displayName);
          return cb(err, user);
        }
      );
    }
  )
);


// Mongoose Schema for posts

const postSchema = new Schema({
  title: String,
  author: String,
  content: String,
});

// Mongoose Schema for user

const userSchema = new Schema({
  email: String,
  password: String,
  googleId: String,
  username: String,
});


userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const Post = post.model("Post", postSchema);
const User = user.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);
app.get(
  "/auth/google/compose",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect("/compose");
  }
);


app.get("/", function (req, res) {
  res.locals.signinStatus = req.isAuthenticated();
  if (req.isAuthenticated()) {
    var username = req.user.username;
  }
  Post.find({}, function (err, foundItems) {
    res.render("home", {
      posts: foundItems,
      username: username,
      // cityName: weatherData.name,
      // temperature: temp,
      // visibility: icon
    });
  // const query = "Hyderabad";
  // const apikey = "83b3269753720654e51dff4fdc6a4ad0";
  // const unit = "metric";
  // const url =
  //   "https://api.openweathermap.org/data/2.5/weather?q=" +
  //   query +
  //   "&appid=" +
  //   apikey +
  //   "&units=" +
  //   unit;
  //  https.get(url, function (response) {
  //   response.on("data", function (data) {
  //     var weatherData = JSON.parse(data);
  //     const temp = weatherData.main.temp;
  //     const description = weatherData.weather[0].description;
  //     res.locals.cityName = weatherData.name,
  //     res.locals.temperature = temp
  //     var icon =
  //       "https://openweathermap.org/img/wn/" +
  //       weatherData.weather[0].icon +
  //       "@2x.png";
      
  //     });
  //   });
   });
});

app.get("/logout", function (req, res) {
  res.locals.signinStatus = req.isAuthenticated();
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

app.get("/login", function (req, res) {
  res.locals.signinStatus = req.isAuthenticated();
  if (req.isAuthenticated()) {
    var username = req.user.username;
  }
  req.session.message = {
    type: "danger",
    intro: "Empty Fields",
    message: "Restart",
  };
  res.render("login", {
    signinStatus: req.isAuthenticated(),
    username: username,
  });
});

app.get("/register", function (req, res) {
  if (req.isAuthenticated()) {
    var username = req.user.username;
  }
  res.locals.signinStatus = req.isAuthenticated();
  res.render("register", {
    signinStatus: 2,
    username: username,
  });
});

app.get("/about", function (req, res) {
  if (req.isAuthenticated()) {
    var username = req.user.username;
  }
  res.locals.signinStatus = req.isAuthenticated();
  res.render("about", {
    username: username,
  });
});

app.get("/contact", function (req, res) {
  res.locals.signinStatus = req.isAuthenticated();
  if (req.isAuthenticated()) {
    var username = req.user.username;
  }
  res.render("contact", {
    username: username,
  });
});

app.get("/compose", function (req, res) {
  res.locals.signinStatus = req.isAuthenticated();
  if (req.isAuthenticated()) {
    var username = req.user.username;
  }
  if (req.isAuthenticated()) {
    res.render("compose", {
      username: username,
    });
  } else {
    res.render("login", {
      username: username,
    });
  }
});

app.get("/posts/:name", function (req, res) {
  const requestedPostId = req.params.name;
  res.locals.signinStatus = req.isAuthenticated();
  if (req.isAuthenticated()) {
    var username = req.user.username;
  }
  Post.findById({ _id: requestedPostId }, function (err, foundPost) {
    if (!err) {
      res.render("post", {
        postTitle: foundPost.title,
        postContent: foundPost.content,
        postAuthor: foundPost.author,
        username: username,
      });
    } else {
      console.log(err);
    }
  });
});

app.get("/report", function (req, res) {
  if (req.isAuthenticated()) {
    var username = req.user.username;
  }
  res.locals.signinStatus = req.isAuthenticated();
  res.render("report", {
    username: username,
  });
});

app.get("/failure", function (req, res) {
  if (req.isAuthenticated()) {
    var username = req.user.username;
  }
  res.locals.signinStatus = req.isAuthenticated();
  res.render("failure", { username: username,})
});

app.post("/register", function (req, res) {
  User.register(
    { username: req.body.username },
    req.body.password,
    function (err, user) {
      if (err) {
          console.log(err);
          res.redirect("/register");
      } else {
        passport.authenticate("local", { failureRedirect: '/failure' })(req, res, function (err) {
          if (!err){
          res.redirect("/compose");
          }
          else {
            console.log(err);
          }
        });
      }
    }
  );
});

app.post("/login", function (req, res) {
  res.locals.signinStatus = req.isAuthenticated();
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, function (err) {
    if (err) {
        console.log(err);
    } 
    else {
    passport.authenticate("local", { failureRedirect: '/failure', failureMessage: true })(req, res, function (err) {
        if (!err){
        res.redirect("/compose");
        }
        else if (! user) {
          res.json({success: false, message: 'username or password incorrect'})
          console.log("err");
        } 
        else{
          console.log(err);
        }
      });
    }
  });
});

app.post("/compose", function (req, res) {
  const post = new Post({
    title: req.body.inputTitle,
    author: req.user.username,
    content: req.body.textAreaPost,
  });

  post.save(function (err) {
    if (!err) {
      res.redirect("/");
    }
  });
});

app.post("/report", function (req, res) {
  res.locals.signinStatus = req.isAuthenticated();
  const ra = req.body.reportAuthor;
  Post.findOneAndDelete(
    { author: req.body.reportAuthor },
    function (err, post) {
      res.redirect("report");
    }
  );
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
