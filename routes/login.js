const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user_model');  

router.route('/login') 
.get((req, res) => { // GET
  req.isAuthenticated() ? res.redirect('/') :  res.render('login');
    req.session.message = {
      type: 'danger',
      intro: 'Empty Fields',
      message: 'Restart',
    };
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
        !err ? res.redirect('/compose') : console.log(err);
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