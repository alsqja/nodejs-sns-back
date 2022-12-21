const authController = require("./auth.js");
const postController = require("./post.js");
const userController = require("./user.js");

module.exports = {
  auth: authController,
  post: postController,
  user: userController,
};
