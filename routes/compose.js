const express = require("express");
const router = express.Router();

const {getCompose,savePost} = require("../controllers/composeController");

router.get("/compose", getCompose);

router.post("/compose", savePost);

module.exports = router;
