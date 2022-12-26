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
};
