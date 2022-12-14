const { comments, posts } = require("../models");
const { isAuthorized } = require("../utils/tokenFunctions");

module.exports = {
  post: async (req, res, next) => {
    const { content } = req.body;
    const accessTokenData = isAuthorized(req);
    const { id } = accessTokenData;
    const { post_id } = req.params;

    try {
      const exPost = await posts.findOne({ where: { id: post_id } });
      if (!exPost) {
        return res.status(404).send({ message: "존재하지 않는 게시글입니다." });
      }
      const newComments = await comments.create({
        user_id: id,
        post_id: Number(post_id),
        content,
      });
      return res
        .status(201)
        .send({ data: newComments, message: "댓글 달기 완료" });
    } catch (err) {
      console.error(err);
      return next(err);
    }
  },
  put: async (req, res, next) => {
    const { content } = req.body;
    const accessTokenData = isAuthorized(req);
    const { id } = accessTokenData;
    const { post_id, comment_id } = req.params;

    try {
      const exComments = await comments.findOne({
        where: { post_id, id: comment_id },
      });
      if (!exComments) {
        return res.status(404).send({ message: "존재하지 않는 댓글입니다." });
      }
      if (exComments.user_id !== id) {
        return res
          .status(401)
          .send({ message: "댓글 작성자만 수정이 가능합니다." });
      }

      await comments.update(
        {
          content,
        },
        {
          where: { id: comment_id },
        }
      );

      return res
        .status(201)
        .send({ id: Number(comment_id), message: "댓글이 수정되었습니다." });
    } catch (err) {
      console.error(err);
      return next(err);
    }
  },
  delete: async (req, res, next) => {
    const id = req.params.comment_id;
    const user_id = isAuthorized(req).id;

    try {
      const exComments = await comments.findOne({
        where: { id },
        attributes: ["user_id"],
      });
      if (exComments.user_id !== user_id) {
        return res.status(403).send({ message: "삭제는 본인만 가능합니다." });
      }
      await comments.destroy({ where: { id } });
      return res.status(204).send("no contents");
    } catch (err) {
      console.error(err);
      return next(err);
    }
  },
};
