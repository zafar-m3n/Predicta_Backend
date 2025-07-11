const { KycDocument, User } = require("../../models");
const { sendEmail } = require("../../utils/emailUtil");

const getAllKycDocuments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    const { count, rows } = await KycDocument.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          attributes: ["id", "full_name", "email"],
        },
      ],
      order: [["submitted_at", "DESC"]],
      offset: parseInt(offset),
      limit: parseInt(limit),
    });

    res.status(200).json({
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      documents: rows,
    });
  } catch (error) {
    console.error("Error in getAllKycDocuments:", error);
    res.status(500).json({ message: "Server error." });
  }
};

const approveKycDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const kycDoc = await KycDocument.findByPk(id, {
      include: [{ model: User, attributes: ["full_name", "email"] }],
    });

    if (!kycDoc) {
      return res.status(404).json({ message: "KYC document not found." });
    }

    if (kycDoc.status !== "pending") {
      return res.status(400).json({ message: "Only pending documents can be approved." });
    }

    kycDoc.status = "approved";
    kycDoc.verified_at = new Date();
    await kycDoc.save();

    await sendEmail(
      kycDoc.User.email,
      "KYC Document Approved",
      `<p>Hello ${kycDoc.User.full_name},</p>
       <p>Your KYC document (${kycDoc.document_type}) has been approved successfully.</p>
       <p>Thank you for verifying your identity with Traders Room.</p>`
    );

    res.status(200).json({ message: "KYC document approved and user notified." });
  } catch (error) {
    console.error("Error in approveKycDocument:", error);
    res.status(500).json({ message: "Server error." });
  }
};

const rejectKycDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_note } = req.body;

    const kycDoc = await KycDocument.findByPk(id, {
      include: [{ model: User, attributes: ["full_name", "email"] }],
    });

    if (!kycDoc) {
      return res.status(404).json({ message: "KYC document not found." });
    }

    if (kycDoc.status !== "pending") {
      return res.status(400).json({ message: "Only pending documents can be rejected." });
    }

    kycDoc.status = "rejected";
    kycDoc.admin_note = admin_note || "Rejected by admin";
    kycDoc.verified_at = new Date();
    await kycDoc.save();

    await sendEmail(
      kycDoc.User.email,
      "KYC Document Rejected",
      `<p>Hello ${kycDoc.User.full_name},</p>
       <p>Your KYC document (${kycDoc.document_type}) has been rejected.</p>
       <p>Reason: ${kycDoc.admin_note}</p>
       <p>Please review and resubmit your document if necessary.</p>`
    );

    res.status(200).json({ message: "KYC document rejected and user notified." });
  } catch (error) {
    console.error("Error in rejectKycDocument:", error);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  getAllKycDocuments,
  approveKycDocument,
  rejectKycDocument,
};
