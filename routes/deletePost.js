const express = require('express');
var mongoose = require('mongoose');
const Schema = mongoose.Schema;
const router = express.Router();

var post = mongoose.createConnection(
    'mongodb+srv://Bharath_xD:Saibharat%40123@cluster0.cgaoktp.mongodb.net/blogDB?retryWrites=true&w=majority'
);

const postSchema = new Schema({
    title: String,
    author: String,
    content: String,
    timestamp: String,
  });

const Post = post.model('Post', postSchema);

router.get('/delete/:name', (req, res) => {
    Post.findByIdAndRemove({ _id: req.params.name }, (err, foundPost) => {
      if (!err) {
        res.redirect('/');
      } 
      else {
        console.log(err);
      }
    });
});

module.exports = router;