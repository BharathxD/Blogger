const passport = require("passport");
const User = require("../models/user_model");

const getLogin = (req, res) => {
  //* GET *//
  req.isAuthenticated() ? res.redirect("/") : res.render("login");
  req.session.message = {
    type: "danger",
    intro: "Empty Fields",
    message: "Restart",
  };
};

const postLogin = (req, res) => {
  //* POST *//
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
        !err ? res.redirect("/compose") : console.log(err);
      });
    }
  });
};

const getLogout = (req, res) => {
    req.logout((err) => {
        if (err) {
          return next(err);
        } else {
          res.redirect("/");
        }
      });
}

module.exports = {getLogin, postLogin, getLogout}
