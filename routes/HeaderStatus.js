// Will set the status of the user on the header according to the sign-in conditions

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));

router.use((req, res, next) => {
  if (req.isAuthenticated()) {
    var username = req.user.username;
  } else {
    var username = "";
  }
  res.locals.username = username;
  res.locals.signinStatus = req.isAuthenticated();
  next();
});

module.exports = router;
