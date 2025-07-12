const bcrypt = require("bcrypt");
const { User, KycDocument, WithdrawalMethod } = require("../models");
const { sendEmail } = require("../utils/emailUtil");

// === Get profile info ===
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "full_name", "email", "phone_number", "country_code", "role"],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// === Update profile info ===
const updateProfile = async (req, res) => {
  try {
    const { full_name, phone_number, country_code } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.full_name = full_name ?? user.full_name;
    user.phone_number = phone_number ?? user.phone_number;
    user.country_code = country_code ?? user.country_code;

    await user.save();

    res.status(200).json({ message: "Profile updated successfully." });
  } catch (error) {
    console.error("Error in updateProfile:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// === Upload KYC document ===
const uploadKycDocument = async (req, res) => {
  try {
    const { document_type } = req.body;
    const document_path = req.file?.path;

    if (!document_type || !document_path) {
      return res.status(400).json({ message: "Document type and file are required." });
    }

    const userId = req.user.id;

    let kycDoc = await KycDocument.findOne({
      where: { user_id: userId, document_type },
    });

    if (kycDoc) {
      kycDoc.document_path = document_path;
      kycDoc.status = "pending";
      await kycDoc.save();
    } else {
      kycDoc = await KycDocument.create({
        user_id: userId,
        document_type,
        document_path,
        status: "pending",
      });
    }

    const user = await User.findByPk(userId);

    const logoUrl = "https://equityfx.co.uk/assets/equityfxlogo-C8QlocGu.jpg";
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; color: #333; background-color: #fff; padding: 20px; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${logoUrl}" alt="EquityFX Logo" style="max-width: 150px; height: auto;" />
        </div>
        <h2 style="color: #0a0a0a;">Hello ${user.full_name},</h2>
        <p style="font-size: 15px; line-height: 1.6;">
          We have received your KYC document (<strong>${document_type}</strong>). It is now pending review by our verification team.
        </p>
        <p style="font-size: 15px; line-height: 1.6;">
          You will be notified once the verification process is complete. Thank you for helping us keep your account secure.
        </p>
        <p style="margin-top: 30px; font-size: 14px; color: #555;">
          — The EquityFX Team
        </p>
      </div>
    `;

    await sendEmail(user.email, "EquityFX: KYC Document Submitted", emailHtml);

    return res.status(201).json({ message: "KYC document uploaded successfully and pending review." });
  } catch (error) {
    console.error("Error in uploadKycDocument:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// === Get all KYC documents for user ===
const getKycDocuments = async (req, res) => {
  try {
    const documents = await KycDocument.findAll({
      where: { user_id: req.user.id },
      order: [["submitted_at", "DESC"]],
    });

    res.status(200).json({ documents });
  } catch (error) {
    console.error("Error in getKycDocuments:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// === Add withdrawal method ===
const addWithdrawalMethod = async (req, res) => {
  try {
    const { type, bank_name, branch, account_number, account_name, swift_code, iban, network, wallet_address } =
      req.body;

    if (!type) {
      return res.status(400).json({ message: "Withdrawal method type is required." });
    }

    await WithdrawalMethod.create({
      user_id: req.user.id,
      type,
      bank_name,
      branch,
      account_number,
      account_name,
      swift_code,
      iban,
      network,
      wallet_address,
      status: "active",
    });

    res.status(201).json({ message: "Withdrawal method added successfully." });
  } catch (error) {
    console.error("Error in addWithdrawalMethod:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// === Get all withdrawal methods for user ===
const getWithdrawalMethods = async (req, res) => {
  try {
    const methods = await WithdrawalMethod.findAll({
      where: { user_id: req.user.id },
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({ methods });
  } catch (error) {
    console.error("Error in getWithdrawalMethods:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// === Change password ===
const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ message: "Current and new passwords are required." });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(current_password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(new_password, salt);

    user.password_hash = password_hash;
    await user.save();

    res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("Error in changePassword:", error);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadKycDocument,
  getKycDocuments,
  addWithdrawalMethod,
  getWithdrawalMethods,
  changePassword,
};
