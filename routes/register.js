const express = require("express");
const router = express.Router();

const {
  getRegister,
  postRegister,
} = require("../controllers/registerController.js");

router.route("/register").get(getRegister).post(postRegister);

module.exports = router;
