const express = require("express");
const router = express.Router();

const {
  getActiveWithdrawalMethodsByUserId,
  createWithdrawalRequest,
} = require("../controllers/withdrawalController");

const authenticate = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");

// Middleware: Auth + Role
router.use(authenticate);
router.use(authorizeRoles("client"));

// Routes
router.get("/withdrawals/methods", getActiveWithdrawalMethodsByUserId);
router.post("/withdrawals", createWithdrawalRequest);

module.exports = router;
