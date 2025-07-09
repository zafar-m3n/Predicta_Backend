const { WalletTransaction, DepositRequest, DepositMethod } = require("../models");

const getWalletBalance = async (req, res) => {
  try {
    const userId = req.user.id;

    // Sum all wallet transactions for the user
    const [{ total_balance }] = await WalletTransaction.findAll({
      where: { user_id: userId },
      attributes: [[WalletTransaction.sequelize.fn("SUM", WalletTransaction.sequelize.col("amount")), "total_balance"]],
      raw: true,
    });

    const totalBalance = total_balance || 0;

    res.status(200).json({ balance: parseFloat(totalBalance) });
  } catch (error) {
    console.error("Error in getWalletBalance:", error);
    res.status(500).json({ message: "Server error." });
  }
};

const getDepositHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await DepositRequest.findAndCountAll({
      where: { user_id: userId },
      include: [
        {
          model: DepositMethod,
          attributes: ["name", "type"],
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
      deposits: rows,
    });
  } catch (error) {
    console.error("Error in getDepositHistory:", error);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  getWalletBalance,
  getDepositHistory,
};
