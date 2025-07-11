const { WithdrawalMethod, WithdrawalRequest, WalletTransaction, KycDocument } = require("../models");

const getActiveWithdrawalMethodsByUserId = async (req, res) => {
  try {
    const userId = req.user.id;

    const methods = await WithdrawalMethod.findAll({
      where: { user_id: userId, status: "active" },
    });

    res.status(200).json({ methods });
  } catch (error) {
    console.error("Error in getActiveWithdrawalMethodsByUserId:", error);
    res.status(500).json({ message: "Server error while fetching withdrawal methods." });
  }
};

// Create a new withdrawal request
const createWithdrawalRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { method_id, amount, note } = req.body;

    if (!method_id || !amount) {
      return res.status(400).json({ message: "Method and amount are required." });
    }

    const method = await WithdrawalMethod.findOne({
      where: { id: method_id, user_id: userId, status: "active" },
    });

    if (!method) {
      return res.status(404).json({ message: "Withdrawal method not found or inactive." });
    }

    await WithdrawalRequest.create({
      user_id: userId,
      method_id,
      amount,
      note: note || null,
      status: "pending",
    });

    res.status(201).json({ message: "Withdrawal request submitted successfully." });
  } catch (error) {
    console.error("Error in createWithdrawalRequest:", error);
    res.status(500).json({ message: "Server error while creating withdrawal request." });
  }
};

// Check if client is eligible to withdraw
const getWithdrawalEligibility = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check KYC docs: at least one ID (id_card or drivers_license) and utility bill, both approved
    const approvedKycDocs = await KycDocument.findAll({
      where: {
        user_id: userId,
        status: "approved",
      },
    });

    const hasIdDoc = approvedKycDocs.some(
      (doc) => doc.document_type === "id_card" || doc.document_type === "drivers_license"
    );

    const hasUtilityBill = approvedKycDocs.some((doc) => doc.document_type === "utility_bill");

    if (!hasIdDoc || !hasUtilityBill) {
      return res.status(200).json({
        eligible: false,
        reason: "KYC documents not fully verified (ID and utility bill required).",
      });
    }

    // Check withdrawal methods
    const activeMethodsCount = await WithdrawalMethod.count({
      where: { user_id: userId, status: "active" },
    });

    if (activeMethodsCount === 0) {
      return res.status(200).json({
        eligible: false,
        reason: "No active withdrawal methods added.",
      });
    }

    // Check wallet balance
    const [{ total_balance }] = await WalletTransaction.findAll({
      where: { user_id: userId },
      attributes: [[WalletTransaction.sequelize.fn("SUM", WalletTransaction.sequelize.col("amount")), "total_balance"]],
      raw: true,
    });

    const balance = parseFloat(total_balance) || 0;

    if (balance <= 0) {
      return res.status(200).json({
        eligible: false,
        reason: "Insufficient wallet balance.",
      });
    }

    // All checks passed
    res.status(200).json({
      eligible: true,
      balance,
    });
  } catch (error) {
    console.error("Error in getWithdrawalEligibility:", error);
    res.status(500).json({ message: "Server error while checking eligibility." });
  }
};

module.exports = {
  getActiveWithdrawalMethodsByUserId,
  createWithdrawalRequest,
  getWithdrawalEligibility,
};
