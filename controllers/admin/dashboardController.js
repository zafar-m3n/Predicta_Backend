const { User, DepositRequest, WithdrawalRequest, WalletTransaction, KycDocument, SupportTicket } = require("../../models");
const { Op } = require("sequelize");

// Get Admin Dashboard Stats
const getDashboardStats = async (req, res) => {
  try {
    // Users
    const totalUsers = await User.count();
    const totalAdmins = await User.count({ where: { role: "admin" } });
    const verifiedEmails = await User.count({ where: { email_verified: true } });

    // Deposits
    const totalDeposits = await DepositRequest.count();
    const pendingDeposits = await DepositRequest.count({ where: { status: "pending" } });
    const approvedDeposits = await DepositRequest.count({ where: { status: "approved" } });
    const rejectedDeposits = await DepositRequest.count({ where: { status: "rejected" } });
    const totalDepositAmount = await DepositRequest.sum("amount", { where: { status: "approved" } });

    // Withdrawals
    const totalWithdrawals = await WithdrawalRequest.count();
    const pendingWithdrawals = await WithdrawalRequest.count({ where: { status: "pending" } });
    const approvedWithdrawals = await WithdrawalRequest.count({ where: { status: "approved" } });
    const rejectedWithdrawals = await WithdrawalRequest.count({ where: { status: "rejected" } });
    const totalWithdrawAmount = await WithdrawalRequest.sum("amount", { where: { status: "approved" } });

    // Wallet Transactions
    const totalWalletTransactions = await WalletTransaction.count();
    const totalWalletAmount = await WalletTransaction.sum("amount");

    // KYC Documents
    const totalKyc = await KycDocument.count();
    const pendingKyc = await KycDocument.count({ where: { status: "pending" } });
    const approvedKyc = await KycDocument.count({ where: { status: "approved" } });
    const rejectedKyc = await KycDocument.count({ where: { status: "rejected" } });

    // Support Tickets
    const totalTickets = await SupportTicket.count();
    const openTickets = await SupportTicket.count({ where: { status: "open" } });
    const closedTickets = await SupportTicket.count({
      where: {
        status: {
          [Op.in]: ["resolved", "closed"],
        },
      },
    });

    // Send response
    res.status(200).json({
      users: {
        total: totalUsers,
        admins: totalAdmins,
        verifiedEmails,
      },
      deposits: {
        total: totalDeposits,
        pending: pendingDeposits,
        approved: approvedDeposits,
        rejected: rejectedDeposits,
        totalAmount: totalDepositAmount || 0,
      },
      withdrawals: {
        total: totalWithdrawals,
        pending: pendingWithdrawals,
        approved: approvedWithdrawals,
        rejected: rejectedWithdrawals,
        totalAmount: totalWithdrawAmount || 0,
      },
      wallet: {
        totalTransactions: totalWalletTransactions,
        totalAmount: totalWalletAmount || 0,
      },
      kyc: {
        total: totalKyc,
        pending: pendingKyc,
        approved: approvedKyc,
        rejected: rejectedKyc,
      },
      tickets: {
        total: totalTickets,
        open: openTickets,
        closed: closedTickets,
      },
    });
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats." });
  }
};

module.exports = {
  getDashboardStats,
};
