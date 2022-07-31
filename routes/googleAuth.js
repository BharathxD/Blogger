const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get(
    '/auth/google',
    passport.authenticate('google', { scope: ['profile'] })
  );
router.get(
    '/auth/google/compose',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      res.redirect('/compose');
    }
);
  
module.exports = router;