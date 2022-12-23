"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class comments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.comments.hasMany(models.likes);
      models.comments.belongsTo(models.users, {
        foreignKey: "user_id",
        onDelete: "CASCADE",
      });
      models.comments.belongsTo(models.posts, {
        foreignKey: "post_id",
        onDelete: "CASCADE",
      });
    }
  }
  comments.init(
    {
      post_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      content: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "comments",
    }
  );
  return comments;
};
