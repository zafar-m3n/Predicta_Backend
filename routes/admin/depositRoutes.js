const express = require("express");
const router = express.Router();

const {
  createDepositMethod,
  getAllDepositMethods,
  getDepositMethodById,
  updateDepositMethod,
  toggleDepositMethodStatus,
} = require("../../controllers/admin/depositsController");

const authenticate = require("../../middlewares/authMiddleware");
const authorizeRoles = require("../../middlewares/roleMiddleware");
const { getMulterUpload } = require("../../config/multerConfig");

// Specify upload directory
const uploadDir = "uploads/deposit-methods";
const upload = getMulterUpload(uploadDir);

// Protect all routes: must be admin
router.use(authenticate);
router.use(authorizeRoles("admin"));

// Create deposit method
router.post(
  "/",
  upload.fields([
    { name: "qr_code", maxCount: 1 },
    { name: "logo", maxCount: 1 },
  ]),
  createDepositMethod
);

// Get all deposit methods
router.get("/", getAllDepositMethods);

// Get a single deposit method
router.get("/:id", getDepositMethodById);

// Update deposit method
router.put(
  "/:id",
  upload.fields([
    { name: "qr_code", maxCount: 1 },
    { name: "logo", maxCount: 1 },
  ]),
  updateDepositMethod
);

// Toggle active/inactive
router.patch("/:id/status", toggleDepositMethodStatus);

module.exports = router;
