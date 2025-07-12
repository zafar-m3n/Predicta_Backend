const { WithdrawalMethod, WithdrawalRequest, WalletTransaction, KycDocument, User } = require("../models");
const { sendEmail } = require("../utils/emailUtil");

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
      include: [{ model: User, attributes: ["full_name", "email"] }],
    });

    if (!method) {
      return res.status(404).json({ message: "Withdrawal method not found or inactive." });
    }

    const withdrawalRequest = await WithdrawalRequest.create({
      user_id: userId,
      method_id,
      amount,
      note: note || null,
      status: "pending",
    });

    // Email setup
    const logoUrl = "https://equityfx.co.uk/assets/equityfxlogo-C8QlocGu.jpg";
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; color: #333; background-color: #fff; padding: 20px; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${logoUrl}" alt="EquityFX Logo" style="max-width: 150px; height: auto;" />
        </div>
        <h2 style="color: #0a0a0a;">Hello ${method.User.full_name},</h2>
        <p style="font-size: 15px; line-height: 1.6;">
          Your withdrawal request for <strong>$${amount}</strong> has been submitted successfully.
        </p>
        <p style="font-size: 15px; line-height: 1.6;">
          Our team will review and process your request as soon as possible. You will receive a notification once it is approved or if any additional information is required.
        </p>
        <p style="margin-top: 30px; font-size: 14px; color: #555;">
          — The EquityFX Team
        </p>
      </div>
    `;

    await sendEmail(method.User.email, "EquityFX: Withdrawal Request Submitted", emailHtml);

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
