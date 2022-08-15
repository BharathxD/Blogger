const Post = require("../models/post_model");

module.exports = (req, res) => {
  Post.findById({ _id: req.params.name }, (err, foundPost) => {
    if (!err) {
      res.render("post", {
        postTitle: foundPost.title,
        postContent: foundPost.content,
        postAuthor: foundPost.author,
        postTime: foundPost.timestamp,
      });
    } else {
      console.log(err);
    }
  });
};
