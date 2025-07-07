const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const DepositMethod = sequelize.define(
  "DepositMethod",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    type: {
      type: DataTypes.ENUM("bank", "crypto", "other"),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active",
    },
  },
  {
    tableName: "deposit_methods",
    timestamps: true,
    underscored: true,
  }
);

module.exports = DepositMethod;
