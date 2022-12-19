const dotenv = require("dotenv");
dotenv.config();

const env = process.env;

const development = {
  username: env.MYSQL_USERNAME,
  password: env.MYSQL_PASSWORD,
  database: env.MYSQL_DATABASE,
  dialect: "mysql",
  host: env.MYSQL_HOST,
};

const production = {
  username: env.MYSQL_USERNAME,
  password: env.MYSQL_PASSWORD,
  database: env.MYSQL_DATABASE,
  dialect: "mysql",
  host: env.MYSQL_HOST,
};

const test = {
  username: env.MYSQL_USERNAME,
  password: env.MYSQL_PASSWORD,
  database: env.MYSQL_DATABASE,
  dialect: "mysql",
  host: env.MYSQL_HOST,
};

module.exports = { development, production, test };
