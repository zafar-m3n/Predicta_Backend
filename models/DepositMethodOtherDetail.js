const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const DepositMethodOtherDetail = sequelize.define(
  "DepositMethodOtherDetail",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    method_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    qr_code_path: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    logo_path: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "deposit_method_other_details",
    timestamps: true,
    underscored: true,
  }
);

module.exports = DepositMethodOtherDetail;
