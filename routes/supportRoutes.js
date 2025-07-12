const express = require("express");
const router = express.Router();

const { createTicket, getMyTickets, getTicketById, sendMessageToTicket } = require("../controllers/supportController");

const authenticate = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");
const { getMulterUpload } = require("../config/multerConfig");

// Specify upload directory
const uploadDir = "uploads/support-tickets";
const upload = getMulterUpload(uploadDir);

// Protect all routes: must be client
router.use(authenticate);
router.use(authorizeRoles("client"));

// Create new ticket
router.post("/", upload.single("attachment"), createTicket);

// Get user's tickets
router.get("/", getMyTickets);

// Get single ticket with messages
router.get("/:id", getTicketById);

// Send client reply
router.post("/:id/messages", upload.single("attachment"), sendMessageToTicket);

module.exports = router;
