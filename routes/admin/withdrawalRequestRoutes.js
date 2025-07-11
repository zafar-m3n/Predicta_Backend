const express = require("express");
const router = express.Router();

const {
  getAllWithdrawalRequests,
  approveWithdrawalRequest,
  rejectWithdrawalRequest,
} = require("../../controllers/admin/withdrawalRequestController");

const authenticate = require("../../middlewares/authMiddleware");
const authorizeRoles = require("../../middlewares/roleMiddleware");

// Protect all routes: must be admin
router.use(authenticate);
router.use(authorizeRoles("admin"));

// Get all withdrawal requests
router.get("/", getAllWithdrawalRequests);

// Approve withdrawal request
router.patch("/:id/approve", approveWithdrawalRequest);

// Reject withdrawal request
router.patch("/:id/reject", rejectWithdrawalRequest);

module.exports = router;
