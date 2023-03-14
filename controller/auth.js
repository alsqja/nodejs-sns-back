const { users } = require("../models");
const passport = require("passport");
const bcrypt = require("bcrypt");
const {
  generateAccessToken,
  generateRefreshToken,
  checkRefeshToken,
} = require("../utils/tokenFunctions");

module.exports = {
  signup: {
    post: async (req, res, next) => {
      const { name, password, profile } = req.body;
      try {
        const exUser = await users.findOne({ where: { name } });
        if (exUser) {
          return res.status(409).send("이미 존재하는 이름입니다.");
        }
        const hash = await bcrypt.hash(password, 12);
        const newUser = await users.create({
          name,
          password: hash,
          profile,
        });
        newUser.password = null;
        return res
          .status(201)
          .send({ data: newUser, message: "회원가입이 완료되었습니다." });
      } catch (error) {
        console.error(error);
        return next(error);
      }
    },
  },
  login: {
    post: async (req, res, next) => {
      passport.authenticate(
        "local",
        { session: false },
        (authError, user, info) => {
          if (authError) {
            console.error(authError);
            return next(authError);
          }
          if (!user) {
            return res.status(404).send("잘못된 아이디 혹은 비밀번호입니다.");
          }
          return req.login(user, (loginError) => {
            if (loginError) {
              console.error(loginError);
              return next(loginError);
            }
            const accessToken = generateAccessToken({
              id: user.id,
              name: user.name,
              profile: user.profile,
            });
            const refreshToken = generateRefreshToken({
              id: user.id,
              name: user.name,
              profile: user.profile,
            });
            res
              .cookie("refreshToken", refreshToken, {
                httpOnly: true,
              })
              .status(201)
              .json({ accessToken: accessToken });
          });
        }
      )(req, res, next);
    },
  },
  // logout: {
  //   get: (req, res) => {
  //     req.logout((err) => {
  //       req.session.destroy();

  //     });
  //     res.status(200).send("로그아웃 되었습니다.");
  //   },
  // },
  refresh: {
    get: (req, res) => {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        // return res.status(403).send("refresh token does not exist, you've never logged in before");
        return res.json({ data: null, message: "refresh token not provided" });
      }

      const refreshTokenData = checkRefeshToken(refreshToken);
      if (!refreshTokenData) {
        return res.json({
          data: null,
          message: "invalid refresh token, please log in again",
        });
      }

      const { id } = refreshTokenData;
      users
        .findOne({ where: { id } })
        .then((data) => {
          if (!data) {
            return res.json({
              data: null,
              message: "refresh token has been tempered",
            });
          }
          delete data.dataValues.password;

          const newAccessToken = generateAccessToken(data.dataValues);
          res.json({
            accessToken: newAccessToken,
            userInfo: data,
            message: "ok",
          });
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },
};
