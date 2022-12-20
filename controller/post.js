const { posts } = require("../models");
const { isAuthorized } = require("../utils/tokenFunctions");

module.exports = {
  post: async (req, res, next) => {
    const { contents, urls } = req.body;
    const accessTokenData = isAuthorized(req);
    const { id } = accessTokenData;

    try {
      const newPosts = await posts.create({
        contents,
        urls,
        user_id: id,
      });
      return res
        .status(201)
        .send({ data: newPosts, message: "게시글이 등록되었습니다." });
    } catch (err) {
      console.error(`post/post error : ${err}`);
      return next(err);
    }
  },
};
