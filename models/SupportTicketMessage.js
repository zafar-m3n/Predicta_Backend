const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const SupportTicketMessage = sequelize.define(
  "SupportTicketMessage",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ticket_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sender: {
      type: DataTypes.ENUM("client", "admin"),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
    },
    attachment_path: {
      type: DataTypes.STRING,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "support_ticket_messages",
    timestamps: false,
  }
);

module.exports = SupportTicketMessage;
