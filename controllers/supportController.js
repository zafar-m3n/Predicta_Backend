const { SupportTicket, SupportTicketMessage, User } = require("../models");
const { Op } = require("sequelize");
const path = require("path");
const { sendEmail } = require("../utils/emailUtil");

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

    const user = await User.findByPk(userId);

    const logoUrl = "https://equityfx.co.uk/assets/equityfxlogo-C8QlocGu.jpg";
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; color: #333; background-color: #fff; padding: 20px; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${logoUrl}" alt="EquityFX Logo" style="max-width: 150px; height: auto;" />
        </div>
        <h2 style="color: #0a0a0a;">Hello ${user.full_name},</h2>
        <p style="font-size: 15px; line-height: 1.6;">
          We have received your support ticket with the subject <strong>"${subject}"</strong>.
        </p>
        <p style="font-size: 15px; line-height: 1.6;">
          Our support team will review your message and get back to you as soon as possible.
        </p>
        <p style="font-size: 15px; line-height: 1.6;">
          Thank you for reaching out to us. We appreciate your patience and will resolve your concern promptly.
        </p>
        <p style="margin-top: 30px; font-size: 14px; color: #555;">
          — The EquityFX Support Team
        </p>
      </div>
    `;

    await sendEmail(user.email, "EquityFX: Support Ticket Submitted", emailHtml);

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
      include: [{ model: User, attributes: ["full_name", "email"] }],
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

    // Email setup
    const logoUrl = "https://equityfx.co.uk/assets/equityfxlogo-C8QlocGu.jpg";
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; color: #333; background-color: #fff; padding: 20px; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${logoUrl}" alt="EquityFX Logo" style="max-width: 150px; height: auto;" />
        </div>
        <h2 style="color: #0a0a0a;">Hello ${ticket.User.full_name},</h2>
        <p style="font-size: 15px; line-height: 1.6;">
          Your reply to the support ticket titled <strong>"${ticket.subject}"</strong> has been received successfully.
        </p>
        <p style="font-size: 15px; line-height: 1.6;">
          Our support team has been notified and will review your latest message promptly.
        </p>
        <p style="font-size: 15px; line-height: 1.6;">
          Thank you for keeping us updated. We appreciate your patience.
        </p>
        <p style="margin-top: 30px; font-size: 14px; color: #555;">
          — The EquityFX Support Team
        </p>
      </div>
    `;

    await sendEmail(ticket.User.email, "EquityFX: Support Ticket Reply Received", emailHtml);

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
