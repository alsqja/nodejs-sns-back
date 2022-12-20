const express = require("express");
const controller = require("../controller");
const { isLoggedIn, isNotLoggedIn, verifyToken } = require("./middlewares");
// delete
const { users } = require("../models");

const router = express.Router();

router.post("/signup", isNotLoggedIn, controller.auth.signup.post);
router.post("/login", isNotLoggedIn, controller.auth.login.post);
router.get("/logout", verifyToken, controller.auth.logout.get);

module.exports = router;
