const express = require("express");
const router = express.Router();

const {
  getAllDepositRequests,
  approveDepositRequest,
  rejectDepositRequest,
} = require("../../controllers/admin/depositsController");

const authenticate = require("../../middlewares/authMiddleware");
const authorizeRoles = require("../../middlewares/roleMiddleware");

// Protect all routes: must be admin
router.use(authenticate);
router.use(authorizeRoles("admin"));

// Get all deposit requests
router.get("/", getAllDepositRequests);

// Approve deposit request
router.patch("/:id/approve", approveDepositRequest);

// Reject deposit request
router.patch("/:id/reject", rejectDepositRequest);

module.exports = router;
