const express = require("express");
const router = express.Router();

const { getLogin, postLogin, getLogout } = require("../controllers/loginController.js");

router.route("/login").get(getLogin).post(postLogin);

//* Logout Route *//

router.get("/logout", getLogout);

module.exports = router;
