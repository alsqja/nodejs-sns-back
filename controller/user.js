const { users, posts, images, comments, likes } = require("../models");
const { isAuthorized } = require("../utils/tokenFunctions");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");

module.exports = {
  get: async (req, res, next) => {
    const { id, limit, page } = req.query;
    try {
      const exUser = await users.findOne({
        where: { id },
        attributes: {
          exclude: ["password"],
        },
        include: [
          {
            model: users,
            as: "followers",
            attributes: ["id", "name", "profile"],
          },
          {
            model: users,
            attributes: ["id", "name", "profile"],
            as: "followings",
          },
        ],
      });

      if (!exUser) {
        return res.status(404).send({ message: "존재하지 않는 사용자입니다." });
      }
      exUser.dataValues.followers.map((el) => {
        delete el.dataValues.follows;
        return el;
      });
      exUser.dataValues.followings.map((el) => {
        delete el.dataValues.follows;
        return el;
      });

      /** post 가져오기 */
      const userPosts = await posts.findAndCountAll({
        limit: Number(limit),
        offset: (Number(page) - 1) * limit,
        distinct: true,
        order: [
          ["views", "DESC"],
          ["createdAt", "DESC"],
        ],
        where: { user_id: id },
        include: [
          { model: images, attributes: ["url"] },
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
        user: exUser,
        posts: userPosts.rows,
        counts: userPosts.count,
        page: Number(page),
      });
      // return res.send(userPosts);
    } catch (err) {
      console.error(err);
      return next(err);
    }
  },
  getMe: async (req, res, next) => {
    const accessTokenData = isAuthorized(req);
    const { id } = accessTokenData;
    try {
      const user = await users.findOne({ where: { id } });
      delete user.dataValues.password;
      if (user) {
        return res.status(200).json({ data: user, message: "ok" });
      }
      return res.status(404).json({ message: "존재하지 않는 회원입니다." });
    } catch (err) {
      console.error(err);
      return next(err);
    }
  },
  put: async (req, res, next) => {
    const accessTokenData = isAuthorized(req);
    const { id } = accessTokenData;
    const { newPassword, profile } = req.body;
    try {
      if (newPassword && profile) {
        const hash = await bcrypt.hash(newPassword, 12);
        await users.update(
          {
            password: hash,
            profile: profile,
          },
          {
            where: { id },
          }
        );
        return res
          .status(200)
          .json({ message: "회원정보 수정이 완료되었습니다." });
      } else if (profile && !newPassword) {
        await users.update(
          {
            profile,
          },
          {
            where: { id },
          }
        );
        return res
          .status(200)
          .json({ message: "회원정보 수정이 완료되었습니다." });
      } else if (!profile && newPassword) {
        const hash = await bcrypt.hash(newPassword, 12);
        await users.update(
          {
            password: newPassword,
          },
          {
            where: { id },
          }
        );
        return res
          .status(200)
          .json({ message: "회원정보 수정이 완료되었습니다." });
      } else {
        return res.status(400).json({ message: "정보를 입력해주세요." });
      }
    } catch (err) {
      console.error(err);
      return next(err);
    }
  },
  delete: async (req, res, next) => {
    const accessTokenData = isAuthorized(req);
    const { id } = accessTokenData;

    try {
      await users.destroy({ where: { id } });
      return res.status(204).send({ message: "완료" });
    } catch (e) {
      console.error(e);
      return next(e);
    }
  },
  search: async (req, res, next) => {
    const { query, limit, page } = req.query;

    try {
      const searchUsers = await users.findAndCountAll({
        where: {
          name: {
            [Op.like]: "%" + query + "%",
          },
        },
        attributes: {
          exclude: ["password"],
        },
        limit: Number(limit),
        offset: (Number(page) - 1) * Number(limit),
      });

      return res.send(searchUsers);
    } catch (err) {
      console.error(err);
      return next(err);
    }
  },
};
