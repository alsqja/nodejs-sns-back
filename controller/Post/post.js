const { Op } = require("sequelize");
const {
  posts,
  images,
  users,
  comments,
  likes,
  follow,
} = require("../../models");
const { isAuthorized } = require("../../utils/tokenFunctions");
const { getPosts } = require("./postFunctions");

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

    if (req.headers.authorization === "Bearer null") {
      try {
        const exPosts = await getPosts(limit, page);
        return res.status(200).send({ ...exPosts, page: Number(page) });
      } catch (err) {
        console.error(err);
        return next(err);
      }
    } else {
      try {
        const accessTokenData = isAuthorized(req);

        if (!accessTokenData) {
          try {
            const exPosts = await getPosts(limit, page);
            return res.status(200).send({ ...exPosts, page: Number(page) });
          } catch (err) {
            console.error(err);
            return next(err);
          }
        }
        const { id } = accessTokenData;

        let followers = await follow.findAll({
          where: { user_id: id },
          raw: true,
        });
        followers = followers.map((el) => el.following_id);

        if (followers.length === 0) {
          try {
            const exPosts = await posts.findAndCountAll({
              limit: Number(limit),
              offset: (Number(page) - 1) * limit,
              distinct: true,
              order: [
                ["views", "DESC"],
                ["createdAt", "DESC"],
              ],
              where: {
                user_id: {
                  [Op.not]: [id],
                },
              },
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
        }

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
        if (followerPosts.count < Number(limit)) {
          const exPosts = await posts.findAndCountAll({
            limit: Number(limit) - followerPosts.count,
            offset: (Number(page) - 1) * limit,
            distinct: true,
            order: [
              ["views", "DESC"],
              ["createdAt", "DESC"],
            ],
            where: {
              user_id: {
                [Op.not]: [...followers, id],
              },
            },
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
          return res.send({
            rows: [...followerPosts.rows, ...exPosts.rows],
            count: followerPosts.count + exPosts.count,
            page: Number(page),
          });
        }
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
  search: async (req, res, next) => {
    const { query, limit, page } = req.query;

    try {
      const searchPosts = await posts.findAndCountAll({
        where: {
          contents: {
            [Op.like]: "%" + query + "%",
          },
        },
        distinct: true,
        limit: Number(limit),
        offset: (Number(page) - 1) * Number(limit),
        order: [["views", "DESC"]],
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

      return res.send(searchPosts);
    } catch (err) {
      console.error(err);
      return next(err);
    }
  },
};
