const { Op } = require("sequelize");
const {
  posts,
  images,
  users,
  comments,
  likes,
  follow,
} = require("../../models");

module.exports = {
  getPosts: async (limit, page, id, followers) => {
    if (!id) {
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
      return exPosts;
    }
    if (followers.length === 0) {
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
      return exPosts;
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
      return {
        rows: [...followerPosts.rows, ...exPosts.rows],
        count: followerPosts.count + exPosts.count,
      };
    }
    return followerPosts;
  },
};
