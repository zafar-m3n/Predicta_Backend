const { SupportTicket, SupportTicketMessage } = require("../models");
const { Op } = require("sequelize");
const path = require("path");

// Create new support ticket
const createTicket = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subject, category, message } = req.body;

    if (!subject || !category || !message) {
      return res.status(400).json({ message: "Subject, category, and message are required." });
    }

    const ticket = await SupportTicket.create({
      user_id: userId,
      subject,
      category,
      status: "open",
    });

    let attachmentPath = null;
    if (req.file) {
      attachmentPath = req.file.path;
    }

    await SupportTicketMessage.create({
      ticket_id: ticket.id,
      sender: "client",
      message,
      attachment_path: attachmentPath,
    });

    res.status(201).json({ message: "Support ticket created successfully.", ticket_id: ticket.id });
  } catch (error) {
    console.error("Error in createTicket:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get all tickets of the current user
const getMyTickets = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await SupportTicket.findAndCountAll({
      where: { user_id: userId },
      order: [["created_at", "DESC"]],
      offset: parseInt(offset),
      limit: parseInt(limit),
    });

    res.status(200).json({
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      tickets: rows,
    });
  } catch (error) {
    console.error("Error in getMyTickets:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get single ticket details including messages
const getTicketById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const ticket = await SupportTicket.findOne({
      where: { id, user_id: userId },
      include: [
        {
          model: SupportTicketMessage,
          order: [["created_at", "ASC"]],
        },
      ],
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found." });
    }

    res.status(200).json({ ticket });
  } catch (error) {
    console.error("Error in getTicketById:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Send message to ticket
const sendMessageToTicket = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required." });
    }

    const ticket = await SupportTicket.findOne({
      where: { id, user_id: userId },
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found." });
    }

    let attachmentPath = null;
    if (req.file) {
      attachmentPath = req.file.path;
    }

    await SupportTicketMessage.create({
      ticket_id: ticket.id,
      sender: "client",
      message,
      attachment_path: attachmentPath,
    });

    res.status(201).json({ message: "Reply sent successfully." });
  } catch (error) {
    console.error("Error in sendMessageToTicket:", error);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  createTicket,
  getMyTickets,
  getTicketById,
  sendMessageToTicket,
};
