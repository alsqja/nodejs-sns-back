"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class likes extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.likes.belongsTo(models.users, {
        foreignKey: "user_id",
        onDelete: "CASCADE",
      });
      models.likes.belongsTo(models.posts, {
        foreignKey: "post_id",
        onDelete: "CASCADE",
      });
      models.likes.belongsTo(models.comments, {
        foreignKey: "comment_id",
        onDelete: "CASCADE",
      });
    }
  }
  likes.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      post_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      comment_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "likes",
      timestamps: false,
    }
  );
  likes.removeAttribute("id");
  return likes;
};
