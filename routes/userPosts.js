const express = require('express');
const router = express.Router();

const User = require('../models/user_model');

router.get('/myposts', (req, res) => {
   User.findById({ _id: req.user._id }, (err, foundUser) => {
      const storeFoundUser = foundUser.posts;
      !err ? res.render('userPosts', {posts: storeFoundUser}) : console.log('Post not found');
   });
});

module.exports = router;