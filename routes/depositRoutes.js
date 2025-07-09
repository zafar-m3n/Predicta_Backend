const express = require("express");
const router = express.Router();

const { getActiveDepositMethods, createDepositRequest } = require("../controllers/depositController");

const authenticate = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");
const { getMulterUpload } = require("../config/multerConfig");

// Specify upload directory
const uploadDir = "uploads/deposit-requests";
const upload = getMulterUpload(uploadDir);

// Middleware: Auth + Role
router.use(authenticate);
router.use(authorizeRoles("client"));

// Routes
router.get("/deposits/methods", getActiveDepositMethods);
router.post("/deposits", upload.single("proof"), createDepositRequest);

module.exports = router;
