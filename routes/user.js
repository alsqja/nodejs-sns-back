const express = require("express");
const controller = require("../controller");
const { verifyToken } = require("./middlewares");

const router = express.Router();

router.get("/me", verifyToken, controller.user.getMe);
router.get("/", controller.user.get);
router.get("/search", controller.user.search);
router.put("/me", verifyToken, controller.user.put);
router.delete("/me", verifyToken, controller.user.delete);

module.exports = router;
