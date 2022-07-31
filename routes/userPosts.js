const express = require('express');
var mongoose = require('mongoose');
const Schema = mongoose.Schema;
const router = express.Router();
const User = require('../models/user_model');

router.get('/myposts', (req, res) => {
   User.findById({ _id: req.user._id }, (err, foundUser) => {
      const storeFoundUser = foundUser.posts;
      if (!err) { 
          res.render('userPosts', {
            posts: storeFoundUser,
          });
      }
      else {
        console.log('Post not found');
      }
   });
});

module.exports = router;