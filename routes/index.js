const express = require("express");
const authRouter = require("./auth");
const postRouter = require("./post");

const router = express.Router();

router.use("/auth", authRouter);
router.use("/post", postRouter);

module.exports = router;
