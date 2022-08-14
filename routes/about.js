/* Require Express Router of type const */

const express = require('express');
const router = express.Router();

/* About Route */

router.get('/about', (req, res) => {res.render('about');});

module.exports = router;