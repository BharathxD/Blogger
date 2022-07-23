//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
var _ = require("lodash");
const ejs = require("ejs");
const mongoose = require("mongoose");
const posts = [];
const homeStartingContent = "";
const aboutContent = "";
const contactContent = "";

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
var New = "hello";
mongoose.connect("mongodb://localhost:27017/blogDB");

const postSchema = {
  title: String,
  author: String,
  content: String,
};

const Post = mongoose.model("Post", postSchema);

app.get("/", function (req, res) {
  Post.find({}, function (err, foundItems) {
    res.render("home", {
      homeStartingContent: homeStartingContent,
      posts: foundItems,
    });
  });
});

app.get("/about", function (req, res) {
  res.render("about", {
    aboutContent: aboutContent,
  });
});

app.get("/contact", function (req, res) {
  res.render("contact", {
    contactContent: contactContent,
  });
});

app.get("/compose", function (req, res) {
  res.render("compose");
});

app.post("/compose", function (req, res) {
  const post = new Post({
    title: req.body.inputTitle,
    author: req.body.inputAuthor,
    content: req.body.textAreaPost,
  });

  post.save(function (err) {
    if (!err) {
      res.redirect("/");
    }
  });
});

app.get("/posts/:name", function (req, res) {
  const requestedPostId = req.params.name;

  Post.findOne({ _id: requestedPostId }, function (err, post) {
    res.render("post", {
      postTitle: post.title,
      postContent: post.content,
      postAuthor: post.author,
    });
  });
});

app.get("/report", function (req, res) {
  res.render("report");
});

app.post("/report", function (req, res) {
  const ra = req.body.reportAuthor;
    Post.findOneAndDelete({ author: req.body.reportAuthor }, function (err, post) {
      res.redirect("report");
    }); 
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});

