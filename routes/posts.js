const express = require('express');
const router = express.Router();

const getPosts = require('../controllers/postsController.js');

router.get('/posts/:name', getPosts);

module.exports = router;