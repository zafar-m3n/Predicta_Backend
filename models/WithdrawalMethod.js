const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const WithdrawalMethod = sequelize.define(
  "WithdrawalMethod",
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
    type: {
      type: DataTypes.ENUM("bank", "crypto"),
      allowNull: false,
    },
    bank_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    branch: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    account_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    account_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    swift_code: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    iban: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    network: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    wallet_address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active",
    },
  },
  {
    tableName: "withdrawal_methods",
    timestamps: true,
    underscored: true,
  }
);

module.exports = WithdrawalMethod;
