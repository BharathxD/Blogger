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
const flash = require("connect-flash");
const https = require("https");
const { result, functions } = require("lodash");
const { log } = require("console");
const posts = [];

const app = express();

var post = mongoose.createConnection(
  "mongodb+srv://Bharath_xD:Saibharat%40123@cluster0.cgaoktp.mongodb.net/blogDB?retryWrites=true&w=majority"
);
var user = mongoose.createConnection(
  "mongodb+srv://Bharath_xD:Saibharat%40123@cluster0.cgaoktp.mongodb.net/userDB?retryWrites=true&w=majority"
);

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
app.use(passport.initialize());
app.use(passport.session());
passport.use(
  new GoogleStrategy(
    {
      clientID:
        "160599315944-h6ul8lcq6vb4lhqkl7qv3skmp2r6fhl7.apps.googleusercontent.com",
      clientSecret: 
      "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",
      callbackURL:
        "http://localhost:3000/auth/google/compose",

    },
    (accessToken, refreshToken, profile, cb) => {
      User.findOrCreate(
        { googleId: profile.id, username: profile.displayName },
        (err, user) => {
          return cb(err, user);
        }
      );
    }
  )
);
app.use((req, res, next) => {
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.use((req, res, next) => {
  if (req.isAuthenticated()) {
    var username = req.user.username;
  } else {
    var username = "";
  }
  res.locals.username = username;
  res.locals.signinStatus = req.isAuthenticated();
  next();
});

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

passport.serializeUser( (user, done) => {
  done(null, user.id);
});

passport.deserializeUser( (id, done) => {
  User.findById(id, (err, user) => {
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
 (req, res) => {
    res.redirect("/compose");
  }
);

app.get("/", (req, res) => {
  Post.find({}, (err, foundItems) => {
    res.render("home", {
      posts: foundItems,
    });
  });
});

app.get("/about", (req, res) => {
  res.locals.signinStatus = req.isAuthenticated();
  res.render("about");
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

app.get("/register", (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/");
  } else {
    res.render("register");
  }
});

app.get("/login", (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/");
  } else {
    req.session.message = {
      type: "danger",
      intro: "Empty Fields",
      message: "Restart",
    };
    res.render("login", {
      signinStatus: req.isAuthenticated(),
    });
  }
});

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    } else {
      setTimeout((err) => {
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

app.get("/compose", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("compose");
  } else {
    res.render("login");
  }
});

app.get("/posts/:name", (req, res) => {
  const requestedPostId = req.params.name;
  Post.findById({ _id: requestedPostId }, (err, foundPost) => {
    if (!err) {
      res.render("post", {
        postTitle: foundPost.title,
        postContent: foundPost.content,
        postAuthor: foundPost.author,
      });
    } else {
      console.log("err");
    }
  });
});

app.get("/report", (req, res) => {
  if (req.isAuthenticated()) {
    var username = req.user.username;
  }
  res.locals.signinStatus = req.isAuthenticated();
  res.render("report", {
    username: username,
  });
});

app.post("/register", (req, res) => {
  User.register(
    { username: req.body.username },
    req.body.password,
    (err, user) => {
      if (err) {
        req.flash("error", err.message);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, (err) => {
          if (!err) {
            res.redirect("/compose");
          } else {
            console.log(err);
          }
        });
      }
    }
  );
});

app.post("/login", (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, (err) => {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local", {
        successFlash: "Welcome!",
        successRedirect: "/compose",
        failureFlash: true,
        failureRedirect: "/login",
      })(req, res, (err) => {
        if (!err) {
          res.redirect("/compose");
        } else {
          console.log(err);
        }
      });
    }
  });
});

app.post("/compose", (req, res) => {
  const post = new Post({
    title: req.body.inputTitle,
    author: req.user.username,
    content: req.body.textAreaPost,
  });

  post.save((err) => {
    if (!err) {
      res.redirect("/");
    }
  });
});

app.post("/report", (req, res) => {
  const ra = req.body.reportAuthor;
  Post.findOneAndDelete(
    { author: req.body.reportAuthor },
   (err, post) => {
      req.flash("success", "We have recieved your report :D ");
      res.redirect("report");
    }
  );
});

app.listen(process.env.PORT || 3000, function(){
  console.log(
    "Express server listening on port %d in %s mode",
    this.address().port,
    app.settings.env
  );
});
