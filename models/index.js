const User = require("./User");
const DepositMethod = require("./DepositMethod");
const DepositMethodBankDetail = require("./DepositMethodBankDetail");
const DepositMethodCryptoDetail = require("./DepositMethodCryptoDetail");
const DepositMethodOtherDetail = require("./DepositMethodOtherDetail");
const DepositRequest = require("./DepositRequest");
const WalletTransaction = require("./WalletTransaction");
const KycDocument = require("./KycDocument");
const WithdrawalMethod = require("./WithdrawalMethod");
const WithdrawalRequest = require("./WithdrawalRequest");
const SupportTicket = require("./SupportTicket");
const SupportTicketMessage = require("./SupportTicketMessage");

// === Associations for deposit methods ===
DepositMethod.hasOne(DepositMethodBankDetail, {
  foreignKey: "method_id",
  onDelete: "CASCADE",
});
DepositMethod.hasOne(DepositMethodCryptoDetail, {
  foreignKey: "method_id",
  onDelete: "CASCADE",
});
DepositMethod.hasOne(DepositMethodOtherDetail, {
  foreignKey: "method_id",
  onDelete: "CASCADE",
});

DepositMethodBankDetail.belongsTo(DepositMethod, { foreignKey: "method_id" });
DepositMethodCryptoDetail.belongsTo(DepositMethod, { foreignKey: "method_id" });
DepositMethodOtherDetail.belongsTo(DepositMethod, { foreignKey: "method_id" });

// === Associations for deposit requests ===
User.hasMany(DepositRequest, { foreignKey: "user_id", onDelete: "CASCADE" });
DepositRequest.belongsTo(User, { foreignKey: "user_id" });

DepositMethod.hasMany(DepositRequest, { foreignKey: "method_id", onDelete: "CASCADE" });
DepositRequest.belongsTo(DepositMethod, { foreignKey: "method_id" });

// === Associations for wallet transactions ===
User.hasMany(WalletTransaction, { foreignKey: "user_id", onDelete: "CASCADE" });
WalletTransaction.belongsTo(User, { foreignKey: "user_id" });

// === Associations for KYC documents ===
User.hasMany(KycDocument, { foreignKey: "user_id", onDelete: "CASCADE" });
KycDocument.belongsTo(User, { foreignKey: "user_id" });

// === Associations for withdrawal methods ===
User.hasMany(WithdrawalMethod, { foreignKey: "user_id", onDelete: "CASCADE" });
WithdrawalMethod.belongsTo(User, { foreignKey: "user_id" });

// === Associations for withdrawal requests ===
User.hasMany(WithdrawalRequest, { foreignKey: "user_id", onDelete: "CASCADE" });
WithdrawalRequest.belongsTo(User, { foreignKey: "user_id" });

WithdrawalMethod.hasMany(WithdrawalRequest, { foreignKey: "method_id", onDelete: "CASCADE" });
WithdrawalRequest.belongsTo(WithdrawalMethod, { foreignKey: "method_id" });

// === Associations for support tickets ===
User.hasMany(SupportTicket, { foreignKey: "user_id", onDelete: "CASCADE" });
SupportTicket.belongsTo(User, { foreignKey: "user_id" });

SupportTicket.hasMany(SupportTicketMessage, { foreignKey: "ticket_id", onDelete: "CASCADE" });
SupportTicketMessage.belongsTo(SupportTicket, { foreignKey: "ticket_id" });

// === Export all models ===
module.exports = {
  User,
  DepositMethod,
  DepositMethodBankDetail,
  DepositMethodCryptoDetail,
  DepositMethodOtherDetail,
  DepositRequest,
  WalletTransaction,
  KycDocument,
  WithdrawalMethod,
  WithdrawalRequest,
  SupportTicket,
  SupportTicketMessage,
};
