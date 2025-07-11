const express = require("express");
const router = express.Router();

const {
  getProfile,
  updateProfile,
  uploadKycDocument,
  getKycDocuments,
  addWithdrawalMethod,
  getWithdrawalMethods,
  deleteWithdrawalMethod,
  changePassword,
} = require("../../controllers/client/profileController");

const authenticate = require("../../middlewares/authMiddleware");
const authorizeRoles = require("../../middlewares/roleMiddleware");
const { getMulterUpload } = require("../../config/multerConfig");

// Specify upload directory for KYC
const uploadDir = "uploads/kyc-documents";
const upload = getMulterUpload(uploadDir);

// All routes require authentication and must be client
router.use(authenticate);
router.use(authorizeRoles("client"));

/* ---------- Profile ---------- */
router.get("/", getProfile);
router.put("/", updateProfile);

/* ---------- KYC Documents ---------- */
router.post("/kyc", upload.single("document"), uploadKycDocument);
router.get("/kyc", getKycDocuments);

/* ---------- Withdrawal Methods ---------- */
router.post("/withdrawal-methods", addWithdrawalMethod);
router.get("/withdrawal-methods", getWithdrawalMethods);
router.delete("/withdrawal-methods/:id", deleteWithdrawalMethod);

/* ---------- Password ---------- */
router.patch("/change-password", changePassword);

module.exports = router;
