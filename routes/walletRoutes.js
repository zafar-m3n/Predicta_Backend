const express = require("express");
const router = express.Router();

const { getWalletBalance, getDepositHistory } = require("../../controllers/walletController");
const authenticate = require("../../middlewares/authMiddleware");
const authorizeRoles = require("../../middlewares/roleMiddleware");

// Protect all wallet routes: must be authenticated as client
router.use(authenticate);
router.use(authorizeRoles("client"));

// Get wallet balance
router.get("/balance", getWalletBalance);

// Get deposit history
router.get("/deposit-history", getDepositHistory);

module.exports = router;
