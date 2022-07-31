const express = require('express');
var mongoose = require('mongoose');
const Schema = mongoose.Schema;
const router = express.Router();
const passport = require('passport');
const User = require('../models/user_model');  

router.route('/login') 
.get((req, res) => { // GET
  if (req.isAuthenticated()) {
    res.redirect('/');
  } 
  else {
    req.session.message = {
      type: 'danger',
      intro: 'Empty Fields',
      message: 'Restart',
    };
    res.render('login');
  }
})
.post((req, res) => { // POST
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, (err) => {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate('local', {
        successFlash: 'Welcome!',
        successRedirect: '/compose',
        failureFlash: true,
        failureRedirect: '/login',
      })(req, res, (err) => {
        if (!err) {
          res.redirect('/compose');
        } else {
          console.log(err);
        }
      });
    }
  });
});

router.get('/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      } 
      else {
        res.redirect('/');
      }
    });
});  

module.exports = router;