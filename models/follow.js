"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class follow extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.follow.belongsTo(models.users, {
        foreignKey: "user_id",
        onDelete: "CASCADE",
      });
      models.follow.belongsTo(models.users, {
        foreignKey: "following_id",
        onDelete: "CASCADE",
      });
    }
  }
  follow.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      following_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "follow",
    }
  );
  return follow;
};
