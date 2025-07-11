const express = require("express");
const router = express.Router();

const { getAllKycDocuments, approveKycDocument, rejectKycDocument } = require("../../controllers/admin/kycController");

const authenticate = require("../../middlewares/authMiddleware");
const authorizeRoles = require("../../middlewares/roleMiddleware");

// Protect all routes: must be admin
router.use(authenticate);
router.use(authorizeRoles("admin"));

// Get all KYC documents
router.get("/", getAllKycDocuments);

// Approve KYC document
router.patch("/:id/approve", approveKycDocument);

// Reject KYC document
router.patch("/:id/reject", rejectKycDocument);

module.exports = router;
