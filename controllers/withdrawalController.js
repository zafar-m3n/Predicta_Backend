const { WithdrawalMethod, WithdrawalRequest } = require("../models");

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

module.exports = {
  getActiveWithdrawalMethodsByUserId,
  createWithdrawalRequest,
};
