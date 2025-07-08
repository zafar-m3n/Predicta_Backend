const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const DepositMethodBankDetail = sequelize.define(
  "DepositMethodBankDetail",
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
    beneficiary_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
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
    ifsc_code: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    banco: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    pix: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    tableName: "deposit_method_bank_details",
    timestamps: false,
    underscored: true,
  }
);

module.exports = DepositMethodBankDetail;
