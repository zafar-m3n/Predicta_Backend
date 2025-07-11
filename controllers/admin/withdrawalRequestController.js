const { WithdrawalRequest, WithdrawalMethod, User, WalletTransaction } = require("../../models");
const { sendEmail } = require("../../utils/emailUtil");

const getAllWithdrawalRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await WithdrawalRequest.findAndCountAll({
      include: [
        {
          model: User,
          attributes: ["id", "full_name", "email"],
        },
        {
          model: WithdrawalMethod,
          attributes: ["id", "type", "bank_name", "account_number", "wallet_address"],
        },
      ],
      order: [["created_at", "DESC"]],
      offset: parseInt(offset),
      limit: parseInt(limit),
    });

    res.status(200).json({
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      requests: rows,
    });
  } catch (error) {
    console.error("Error in getAllWithdrawalRequests:", error);
    res.status(500).json({ message: "Server error." });
  }
};

const approveWithdrawalRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const withdrawalRequest = await WithdrawalRequest.findByPk(id, {
      include: [{ model: User, attributes: ["full_name", "email"] }],
    });

    if (!withdrawalRequest) {
      return res.status(404).json({ message: "Withdrawal request not found." });
    }

    if (withdrawalRequest.status !== "pending") {
      return res.status(400).json({ message: "Only pending requests can be approved." });
    }

    withdrawalRequest.status = "approved";
    await withdrawalRequest.save();

    await WalletTransaction.create({
      user_id: withdrawalRequest.user_id,
      type: "withdrawal",
      amount: -Math.abs(withdrawalRequest.amount), // Ensure negative
      reference_id: withdrawalRequest.id,
      description: "Withdrawal approved by admin",
    });

    await sendEmail(
      withdrawalRequest.User.email,
      "Withdrawal Request Approved",
      `<p>Hello ${withdrawalRequest.User.full_name},</p>
       <p>Your withdrawal request of $${withdrawalRequest.amount} has been approved. The funds will be processed shortly.</p>
       <p>Thank you for using Traders Room.</p>`
    );

    res.status(200).json({ message: "Withdrawal request approved and wallet updated." });
  } catch (error) {
    console.error("Error in approveWithdrawalRequest:", error);
    res.status(500).json({ message: "Server error." });
  }
};

const rejectWithdrawalRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_note } = req.body;

    const withdrawalRequest = await WithdrawalRequest.findByPk(id, {
      include: [{ model: User, attributes: ["full_name", "email"] }],
    });

    if (!withdrawalRequest) {
      return res.status(404).json({ message: "Withdrawal request not found." });
    }

    if (withdrawalRequest.status !== "pending") {
      return res.status(400).json({ message: "Only pending requests can be rejected." });
    }

    withdrawalRequest.status = "rejected";
    withdrawalRequest.admin_note = admin_note || "Rejected by admin";
    await withdrawalRequest.save();

    await sendEmail(
      withdrawalRequest.User.email,
      "Withdrawal Request Rejected",
      `<p>Hello ${withdrawalRequest.User.full_name},</p>
       <p>Your withdrawal request of $${withdrawalRequest.amount} has been rejected.</p>
       <p>Reason: ${withdrawalRequest.admin_note}</p>
       <p>If you have any questions, please contact support.</p>`
    );

    res.status(200).json({ message: "Withdrawal request rejected and user notified." });
  } catch (error) {
    console.error("Error in rejectWithdrawalRequest:", error);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  getAllWithdrawalRequests,
  approveWithdrawalRequest,
  rejectWithdrawalRequest,
};
