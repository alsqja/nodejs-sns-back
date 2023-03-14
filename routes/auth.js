const express = require("express");
const controller = require("../controller");
const { verifyToken } = require("./middlewares");

const router = express.Router();

router.post("/signup", controller.auth.signup.post);
router.post("/login", controller.auth.login.post);
// router.get("/logout", verifyToken, controller.auth.logout.get);
router.get("/refresh", controller.auth.refresh.get);

module.exports = router;
