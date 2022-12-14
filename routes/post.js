const express = require("express");
const controller = require("../controller");
const { verifyToken } = require("./middlewares");

const router = express.Router();

router.get("/", controller.post.get);
router.get("/search", controller.post.search);
router.get("/:id", controller.post.detail);
router.post("/", verifyToken, controller.post.post);
router.put("/:id", verifyToken, controller.post.put);
router.delete("/:id", verifyToken, controller.post.delete);
router.post("/:post_id/comment", verifyToken, controller.comment.post);
router.put(
  "/:post_id/comment/:comment_id",
  verifyToken,
  controller.comment.put
);
router.delete(
  "/:post_id/comment/:comment_id",
  verifyToken,
  controller.comment.delete
);

module.exports = router;
