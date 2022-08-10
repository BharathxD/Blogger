const express = require('express');
const router = express.Router();
const Post = require('../models/post_model');

router.get('/', (req, res) => {
    Post.find((err, foundItems) => {
      !err ? res.render('home', {posts: foundItems}) : console.log(err);
   });
});

module.exports = router;