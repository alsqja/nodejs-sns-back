const express = require("express");
const authRouter = require("./auth");
const postRouter = require("./post");
const userRouter = require("./user");
const followRouter = require("./follow");
const likeRouter = require("./like");

const router = express.Router();

router.use("/auth", authRouter);
router.use("/post", postRouter);
router.use("/user", userRouter);
router.use("/follow", followRouter);
router.use("/like", likeRouter);

module.exports = router;
