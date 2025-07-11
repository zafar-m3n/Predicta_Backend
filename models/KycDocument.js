const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const KycDocument = sequelize.define(
  "KycDocument",
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
    document_type: {
      type: DataTypes.ENUM("id_card", "drivers_license", "utility_bill"),
      allowNull: false,
    },
    document_path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    admin_note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    submitted_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "kyc_documents",
    timestamps: false,
    underscored: true,
  }
);

module.exports = KycDocument;
