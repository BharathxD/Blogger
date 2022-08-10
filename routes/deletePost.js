const express = require('express');
const router = express.Router();
const Post = require('../models/post_model');

router.get('/delete/:name', (req, res) => {
    Post.findByIdAndRemove({ _id: req.params.name }, (err, foundPost) => {
      !err ? res.redirect('/') : console.log(err);
    });
});

module.exports = router;