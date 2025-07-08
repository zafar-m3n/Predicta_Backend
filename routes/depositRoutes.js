const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const { getActiveDepositMethods, createDepositRequest } = require("../../controllers/client/depositController");

const authenticate = require("../../middlewares/authMiddleware");
const authorizeRoles = require("../../middlewares/roleMiddleware");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/deposit-requests");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.use(authenticate);
router.use(authorizeRoles("client"));

router.get("/deposits/methods", getActiveDepositMethods);

router.post("/deposits", upload.single("proof"), createDepositRequest);

module.exports = router;
