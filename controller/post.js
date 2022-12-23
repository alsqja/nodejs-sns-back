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
  delete: async (req, res, next) => {
    const { id } = req.params;
    const accessTokenData = isAuthorized(req);
    const user_id = accessTokenData.id;

    try {
      const exPost = await posts.findOne({
        where: { id },
        attributes: ["user_id"],
      });
      if (exPost.user_id !== user_id) {
        return res
          .status(401)
          .send({ message: "게시글은 본인만 삭제할 수 있습니다." });
      }
      const postImages = await images.findAll({
        where: { post_id: id },
        attributes: ["id"],
      });
      for (let i = 0; i < postImages.length; i++) {
        await images.destroy({ where: { id: postImages[i].id } });
      }
      await posts.destroy({
        where: { id },
      });
      return res.status(204).send({ message: "완료" });
    } catch (err) {
      console.error(err);
      return next(err);
    }
  },
};
