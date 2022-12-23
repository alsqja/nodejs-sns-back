"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.users.hasMany(models.posts, {
        foreignKey: "user_id",
        onDelete: "cascade",
        hooks: true,
      });
      models.users.hasMany(models.images, {
        foreignKey: "user_id",
        onDelete: "cascade",
        hooks: true,
      });
      models.users.hasMany(models.comments, {
        foreignKey: "user_id",
        onDelete: "cascade",
        hooks: true,
      });
      models.users.hasMany(models.likes, {
        foreignKey: "user_id",
        onDelete: "cascade",
        hooks: true,
      });
    }
  }
  users.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      profile: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "users",
    }
  );
  return users;
};
