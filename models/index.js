const User = require("./User");
const DepositMethod = require("./DepositMethod");
const DepositMethodBankDetail = require("./DepositMethodBankDetail");
const DepositMethodCryptoDetail = require("./DepositMethodCryptoDetail");
const DepositMethodOtherDetail = require("./DepositMethodOtherDetail");
const DepositRequest = require("./DepositRequest");
const WalletTransaction = require("./WalletTransaction");

// Define associations for deposit methods
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

// Associations for deposit requests
User.hasMany(DepositRequest, { foreignKey: "user_id", onDelete: "CASCADE" });
DepositRequest.belongsTo(User, { foreignKey: "user_id" });

DepositMethod.hasMany(DepositRequest, { foreignKey: "method_id", onDelete: "CASCADE" });
DepositRequest.belongsTo(DepositMethod, { foreignKey: "method_id" });

// Associations for wallet transactions
User.hasMany(WalletTransaction, { foreignKey: "user_id", onDelete: "CASCADE" });
WalletTransaction.belongsTo(User, { foreignKey: "user_id" });

// Export all models
module.exports = {
  User,
  DepositMethod,
  DepositMethodBankDetail,
  DepositMethodCryptoDetail,
  DepositMethodOtherDetail,
  DepositRequest,
  WalletTransaction,
};
