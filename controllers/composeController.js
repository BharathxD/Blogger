const Post = require("../models/post_model");
const User = require("../models/user_model");

const date = require("../public/js/date");

const getCompose = (req, res) => {
    req.isAuthenticated() ? res.render("compose") : res.render("login");
}

const savePost = (req, res) => {
User.findById(req.user.id, (err, foundUser) => {
  if (err) {
    console.log(err);
    res.redirect("/compose");
  } else {
    const post = new Post({
      title: req.body.inputTitle,
      author: req.user.username,
      content: req.body.textAreaPost,
      timestamp: date,
    });
    foundUser.posts.push(post);
    foundUser.save();
    post.save((err) => {
      if (!err) {
        res.redirect("/");
      }
    });
  }
});
}

module.exports = {getCompose, savePost};