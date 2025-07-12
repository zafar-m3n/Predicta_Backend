const { SupportTicket, SupportTicketMessage, User } = require("../../models");
const { sendEmail } = require("../../utils/emailUtil");

// Get all tickets
const getAllTickets = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    const { count, rows } = await SupportTicket.findAndCountAll({
      where: whereClause,
      include: [{ model: User, attributes: ["id", "full_name", "email"] }],
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
    console.error("Error in getAllTickets:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get single ticket with messages
const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await SupportTicket.findByPk(id, {
      include: [
        { model: User, attributes: ["id", "full_name", "email"] },
        { model: SupportTicketMessage, order: [["created_at", "ASC"]] },
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

// Send admin reply to ticket
const sendMessageToTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required." });
    }

    const ticket = await SupportTicket.findByPk(id, {
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
      sender: "admin",
      message,
      attachment_path: attachmentPath,
    });

    // Send email notification to user
    await sendEmail(
      ticket.User.email,
      "New Reply to Your Support Ticket",
      `<p>Hello ${ticket.User.full_name},</p>
       <p>You have received a new reply to your support ticket: <strong>${ticket.subject}</strong>.</p>
       <p>Please log in to view and reply.</p>
       <p>Thank you,<br/>Traders Room Support Team</p>`
    );

    res.status(201).json({ message: "Reply sent successfully and user notified." });
  } catch (error) {
    console.error("Error in sendMessageToTicket:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Close a ticket
const closeTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await SupportTicket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found." });
    }

    if (ticket.status === "closed") {
      return res.status(400).json({ message: "Ticket is already closed." });
    }

    ticket.status = "closed";
    await ticket.save();

    res.status(200).json({ message: "Ticket closed successfully." });
  } catch (error) {
    console.error("Error in closeTicket:", error);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  getAllTickets,
  getTicketById,
  sendMessageToTicket,
  closeTicket,
};
