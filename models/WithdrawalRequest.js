const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const WithdrawalRequest = sequelize.define(
  "WithdrawalRequest",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    method_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    admin_note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "withdrawal_requests",
    timestamps: true,
    underscored: true,
  }
);

module.exports = WithdrawalRequest;
