const express = require("express");
const router = express.Router();

const {
  getAllTickets,
  getTicketById,
  sendMessageToTicket,
  closeTicket,
} = require("../../controllers/admin/supportController");

const authenticate = require("../../middlewares/authMiddleware");
const authorizeRoles = require("../../middlewares/roleMiddleware");
const { getMulterUpload } = require("../../config/multerConfig");

// Specify upload directory
const uploadDir = "uploads/support-tickets";
const upload = getMulterUpload(uploadDir);

// Protect all routes: must be admin
router.use(authenticate);
router.use(authorizeRoles("admin"));

// Get all tickets
router.get("/", getAllTickets);

// Get single ticket with messages
router.get("/:id", getTicketById);

// Send admin reply
router.post("/:id/messages", upload.single("attachment"), sendMessageToTicket);

// Close ticket
router.patch("/:id/close", closeTicket);

module.exports = router;
