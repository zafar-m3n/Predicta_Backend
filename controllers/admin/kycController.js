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

    const logoUrl = "https://equityfx.co.uk/assets/equityfxlogo-C8QlocGu.jpg";
    const documentTypeMap = {
      id_card: "Identity Card",
      drivers_license: "Driver’s License",
      utility_bill: "Utility Bill",
    };
    const documentTypeLabel = documentTypeMap[kycDoc.document_type] || "KYC Document";

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; color: #333; background-color: #fff; padding: 20px; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${logoUrl}" alt="EquityFX Logo" style="max-width: 150px; height: auto;" />
        </div>
        <h2 style="color: #0a0a0a;">Hello ${kycDoc.User.full_name},</h2>
        <p style="font-size: 15px; line-height: 1.6;">
          We are pleased to inform you that your ${documentTypeLabel} has been <strong>approved</strong>.
        </p>
        <p style="font-size: 15px; line-height: 1.6;">
          Your account is now fully verified, and you can enjoy uninterrupted access to all features of EquityFX.
        </p>
        <p style="margin-top: 30px; font-size: 14px; color: #555;">
          — The EquityFX Team
        </p>
      </div>
    `;

    await sendEmail(kycDoc.User.email, "EquityFX: KYC Document Approved", emailHtml);

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

    const logoUrl = "https://equityfx.co.uk/assets/equityfxlogo-C8QlocGu.jpg";
    const documentTypeMap = {
      id_card: "Identity Card",
      drivers_license: "Driver’s License",
      utility_bill: "Utility Bill",
    };
    const documentTypeLabel = documentTypeMap[kycDoc.document_type] || "KYC Document";

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; color: #333; background-color: #fff; padding: 20px; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${logoUrl}" alt="EquityFX Logo" style="max-width: 150px; height: auto;" />
        </div>
        <h2 style="color: #0a0a0a;">Hello ${kycDoc.User.full_name},</h2>
        <p style="font-size: 15px; line-height: 1.6;">
          We regret to inform you that your ${documentTypeLabel} has been <strong>rejected</strong>.
        </p>
        <p style="font-size: 15px; line-height: 1.6;">
          <strong>Reason:</strong> ${kycDoc.admin_note}
        </p>
        <p style="font-size: 15px; line-height: 1.6;">
          Please review your document and resubmit it to complete your verification with EquityFX.
        </p>
        <p style="margin-top: 30px; font-size: 14px; color: #555;">
          — The EquityFX Team
        </p>
      </div>
    `;

    await sendEmail(kycDoc.User.email, "EquityFX: KYC Document Rejected", emailHtml);

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
