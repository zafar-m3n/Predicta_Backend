const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { getActiveDepositMethods, createDepositRequest } = require("../controllers/depositController");

const authenticate = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");

// Ensure upload folder exists
const uploadDir = "uploads/deposit-requests";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Middleware: Auth + Role
router.use(authenticate);
router.use(authorizeRoles("client"));

// Routes
router.get("/deposits/methods", getActiveDepositMethods);
router.post("/deposits", upload.single("proof"), createDepositRequest);

module.exports = router;
