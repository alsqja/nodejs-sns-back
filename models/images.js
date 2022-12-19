"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class images extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  images.init(
    {
      post_id: {
        allowNull: true,
        type: DataTypes.INERGER,
      },
      user_id: {
        allowNull: false,
        type: DataTypes.INERGER,
      },
      urls: {
        allowNull: false,
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "images",
    }
  );
  return images;
};
