const { posts, images, comments, likes } = require("../models");
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
  put: async (req, res, next) => {
    const { contents, urls } = req.body;
    const accessTokenData = isAuthorized(req);
    const { id } = accessTokenData;
    const post_id = Number(req.params.id);

    try {
      const updated = await posts.update(
        {
          contents,
          user_id: id,
        },
        {
          where: { id: post_id },
        }
      );
      await images.destroy({ where: { post_id } });
      const imgUrls = [];
      for (let i = 0; i < urls.length; i++) {
        const newImg = await images.create({
          user_id: id,
          post_id,
          url: urls[i],
        });
        imgUrls.push(newImg.url);
      }
      console.log(updated);
      return res.status(201).send({
        data: { id: post_id },
        message: "게시글이 수정되었습니다.",
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
      });
      if (exPost.user_id !== user_id) {
        return res
          .status(401)
          .send({ message: "게시글은 본인만 삭제할 수 있습니다." });
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
