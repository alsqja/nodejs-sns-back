const express = require("express");
const controller = require("../controller");
const { verifyToken } = require("./middlewares");

const router = express.Router();

router.get("/me", verifyToken, controller.user.getMe);

module.exports = router;
