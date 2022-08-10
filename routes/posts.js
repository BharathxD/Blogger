const express = require('express');
const router = express.Router();
const Post = require('../models/post_model');

router.get('/posts/:name', (req, res) => {
    Post.findById({ _id: req.params.name }, (err, foundPost) => {
      if (!err) {
        res.render('post', {
          postTitle: foundPost.title,
          postContent: foundPost.content,
          postAuthor: foundPost.author,
          postTime: foundPost.timestamp,
        });
      } 
      else {
        console.log(err);
      }
    });
  });

module.exports = router;