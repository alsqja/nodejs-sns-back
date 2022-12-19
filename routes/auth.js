const express = require("express");
const controller = require("../controller");
// delete
const { users } = require("../models");

const router = express.Router();

router.get("/signup", async (req, res) => {
  const allUsers = await users.findAll({});
  res.json({ data: allUsers });
});

module.exports = router;
