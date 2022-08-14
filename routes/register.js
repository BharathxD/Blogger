const express = require('express');
const router = express.Router();

const passport = require('passport');

const User = require('../models/user_model');

router.route('/register') 
.get((req, res) => { //* GET *//
  if (req.isAuthenticated()) {
    res.redirect('/');
  } else {
    res.render('register');
  }
}).
post( (req, res) => { //* POST *//
   User.register(
    { username: req.body.username },
    req.body.password,
    (err, user) => {
      if (err) {
        req.flash('error', err.message);
        res.redirect('/register');
      } 
      else {
        passport.authenticate('local')(req, res, (err) => {
         !err ? res.redirect('/compose') : console.log(err);
        });
      }
    }
  );
});

module.exports = router;