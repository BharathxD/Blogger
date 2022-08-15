/* Express Router */

const express = require("express");
const router = express.Router();

const homeController = require('../controllers/homeController.js');

/* Home Route */ 

router.get("/", homeController);

module.exports = router;
