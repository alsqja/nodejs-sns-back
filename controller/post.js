const { Op } = require("sequelize");
const { posts, images, users, comments, likes, follow } = require("../models");
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
  get: async (req, res, next) => {
    const { limit, page } = req.query;

    if (!req.headers.authorization) {
      try {
        const exPosts = await posts.findAndCountAll({
          limit: Number(limit),
          offset: (Number(page) - 1) * limit,
          distinct: true,
          order: [
            ["views", "DESC"],
            ["createdAt", "DESC"],
          ],
          include: [
            { model: images, attributes: ["url"] },
            { model: users, attributes: ["id", "name", "profile"] },
            {
              model: likes,
              where: { comment_id: null },
              required: false,
            },
            {
              model: comments,
              attributes: ["id", "content"],
              include: [
                { model: users, attributes: ["id", "name", "profile"] },
                {
                  model: likes,
                  attributes: ["id", "post_id", "comment_id", "user_id"],
                },
              ],
            },
          ],
        });
        return res.status(200).send({ ...exPosts, page: Number(page) });
      } catch (err) {
        console.error(err);
        return next(err);
      }
    } else {
      try {
        const accessTokenData = isAuthorized(req);
        const { id } = accessTokenData;
        let followers = await follow.findAll({
          where: { user_id: id },
          raw: true,
        });
        followers = followers.map((el) => el.following_id);

        const followerPosts = await posts.findAndCountAll({
          where: {
            user_id: {
              [Op.or]: followers,
            },
          },
          limit: Number(limit),
          offset: (Number(page) - 1) * limit,
          distinct: true,
          order: [
            ["views", "DESC"],
            ["createdAt", "DESC"],
          ],
          include: [
            { model: images, attributes: ["url"] },
            { model: users, attributes: ["id", "name", "profile"] },
            {
              model: likes,
              where: { comment_id: null },
              required: false,
            },
            {
              model: comments,
              attributes: ["id", "content"],
              include: [
                { model: users, attributes: ["id", "name", "profile"] },
                {
                  model: likes,
                  attributes: ["id", "post_id", "comment_id", "user_id"],
                },
              ],
            },
          ],
        });
        return res.send({ ...followerPosts, page: Number(page) });
      } catch (err) {
        console.error(err);
        return next(err);
      }
    }
  },
  detail: async (req, res, next) => {
    const { id } = req.params;
    try {
      const exPost = await posts.findOne({
        where: { id },
        include: [
          { model: images, attributes: ["url"] },
          { model: users, attributes: ["id", "name", "profile"] },
          {
            model: comments,
            attributes: ["id", "content"],
            include: [
              { model: users, attributes: ["id", "name", "profile"] },
              {
                model: likes,
                attributes: ["id", "post_id", "comment_id", "user_id"],
              },
            ],
          },
          {
            model: likes,
            where: { comment_id: null },
            required: false,
          },
        ],
      });
      await posts.update({ views: exPost.views + 1 }, { where: { id } });
      return res.send(exPost);
    } catch (err) {
      console.error(err);
      return next(err);
    }
  },
};
