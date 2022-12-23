"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class post_hashtag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.post_hashtag.belongsTo(models.posts, {
        foreignKey: "post_id",
        onDelete: "CASCADE",
      });
      models.post_hashtag.belongsTo(models.hashtags, {
        foreignKey: "hashtag_id",
        onDelete: "CASCADE",
      });
    }
  }
  post_hashtag.init(
    {
      post_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      hashtag_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "post_hashtag",
    }
  );
  return post_hashtag;
};
