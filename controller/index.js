const authController = require("./auth.js");
const postController = require("./post.js");
const userController = require("./user.js");
const followController = require("./follow");

module.exports = {
  auth: authController,
  post: postController,
  user: userController,
  follow: followController,
};
