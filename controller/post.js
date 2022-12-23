const { posts, images } = require("../models");
const { isAuthorized } = require("../utils/tokenFunctions");

module.exports = {
  post: async (req, res, next) => {
    const { contents, urls } = req.body;
    const accessTokenData = isAuthorized(req);
    const { id } = accessTokenData;

    try {
      const newPosts = await posts.create({
        contents,
        user_id: id,
      });
      const post_id = newPosts.id;
      const imgUrls = [];
      for (let i = 0; i < urls.length; i++) {
        const newImg = await images.create({
          user_id: id,
          post_id,
          url: urls[i],
        });
        imgUrls.push(newImg.url);
      }
      return res.status(201).send({
        data: { ...newPosts.dataValues, urls: imgUrls },
        message: "게시글이 등록되었습니다.",
      });
    } catch (err) {
      console.error(`new post error : ${err}`);
      return next(err);
    }
  },
};
