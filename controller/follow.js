const { follow } = require("../models");
const { isAuthorized } = require("../utils/tokenFunctions");

module.exports = {
  post: async (req, res, next) => {
    const accessTokenData = isAuthorized(req);
    const { id } = accessTokenData;
    const { following_id, isPlus } = req.body;

    try {
      if (isPlus) {
        const newFollowing = await follow.create({
          user_id: id,
          following_id,
        });
        return res
          .status(201)
          .send({ data: newFollowing, message: "팔로우 성공" });
      } else {
        await follows.destroy({
          where: { user_id: id, following_id },
        });
        return res.status(204).send({ message: "팔로우 취소 성공" });
      }
    } catch (err) {
      console.error(err);
      return next(err);
    }
  },
};
