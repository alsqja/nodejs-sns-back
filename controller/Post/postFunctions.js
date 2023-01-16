const {
  posts,
  images,
  users,
  comments,
  likes,
  follow,
} = require("../../models");

module.exports = {
  getPosts: async (limit, page, accessToken, followers) => {
    if (!accessToken) {
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
    }
  },
};
