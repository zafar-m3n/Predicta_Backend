const { WalletTransaction, DepositRequest, DepositMethod } = require("../models");

const getWalletBalance = async (req, res) => {
  try {
    const userId = req.user.id;

    // Sum all wallet transactions for the user
    const result = await WalletTransaction.findAll({
      where: { user_id: userId },
      attributes: [[WalletTransaction.sequelize.fn("SUM", WalletTransaction.sequelize.col("amount")), "total_balance"]],
      raw: true,
    });

    const totalBalance = result[0].total_balance || 0;

    res.status(200).json({ balance: parseFloat(totalBalance) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

const getDepositHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const deposits = await DepositRequest.findAll({
      where: { user_id: userId },
      include: [
        {
          model: DepositMethod,
          attributes: ["name", "type"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({ deposits });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  getWalletBalance,
  getDepositHistory,
};
