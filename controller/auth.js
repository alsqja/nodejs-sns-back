const model = require("../models");

module.exports = {
  post: (req, res) => {
    model.users.findAll();
  },
};
