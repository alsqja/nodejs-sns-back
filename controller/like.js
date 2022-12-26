const { likes, comments, posts } = require("../models");
const { isAuthorized } = require("../utils/tokenFunctions");

module.exports = {
  post: async (req, res, next) => {
    const { post_id, comment_id, isPlus } = req.body;
    const accessTokenData = isAuthorized(req);
    const { id } = accessTokenData;

    try {
      if (comment_id) {
        const exComment = await comments.findOne({
          where: { id: comment_id, post_id, user_id: id },
          attributes: ["id"],
        });
        if (!exComment) {
          return res.status(404).send({ message: "존재하지 않는 댓글입니다." });
        }
      } else {
        const exPost = await posts.findOne({
          where: { id: post_id, user_id: id },
          attributes: ["id"],
        });
        if (!exPost) {
          return res
            .status(404)
            .send({ message: "존재하지 않는 게시글입니다." });
        }
      }
      if (isPlus) {
        const newLikes = await likes.create({
          post_id,
          comment_id,
          user_id: id,
        });
        return res.status(201).send({ data: newLikes, message: "좋아요 완료" });
      } else {
        await likes.destroy({
          where: {
            post_id,
            comment_id,
            user_id: id,
          },
        });
        return res.status(204).send("no content");
      }
    } catch (err) {
      console.error(err);
      return next(err);
    }
  },
};
