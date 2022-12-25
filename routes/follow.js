const express = require("express");
const controller = require("../controller");
const { verifyToken } = require("./middlewares");

const router = express.Router();

router.post("/", verifyToken, controller.follow.post);

module.exports = router;
