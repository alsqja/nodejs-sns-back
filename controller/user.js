const { users } = require("../models");
const { isAuthorized } = require("../utils/tokenFunctions");

module.exports = {
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
        await users.update(
          {
            password: newPassword,
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
};
