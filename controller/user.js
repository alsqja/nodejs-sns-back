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
};
