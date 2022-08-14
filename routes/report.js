const express = require('express');
const router = express.Router();

const Post = require('../models/post_model');

router.route('/report')
.get((req, res) => {  // GET
  res.render('report');
})
.post((req, res) => { // POST 
  Post.findOneAndDelete({ author: req.body.reportAuthor }, (err, post) => {
    req.flash('success', 'We have recieved your report :D ');
    res.redirect('report');
  });
});

module.exports = router;