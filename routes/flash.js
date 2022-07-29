const express = require('express');
const router = express.Router();
const flash = require('connect-flash');

router.use((req, res, next) => {
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

module.exports = router;
