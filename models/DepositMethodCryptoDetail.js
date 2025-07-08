const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const DepositMethodCryptoDetail = sequelize.define(
  "DepositMethodCryptoDetail",
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
    network: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    qr_code_path: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    logo_path: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "deposit_method_crypto_details",
    timestamps: false,
    underscored: true,
  }
);

module.exports = DepositMethodCryptoDetail;
