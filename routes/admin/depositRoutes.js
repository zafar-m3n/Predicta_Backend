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
const multer = require("multer");

// File upload config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/deposit-methods");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage });

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
