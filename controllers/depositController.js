const {
  DepositMethod,
  DepositMethodBankDetail,
  DepositMethodCryptoDetail,
  DepositMethodOtherDetail,
  DepositRequest,
  User,
} = require("../models");
const { sendEmail } = require("../utils/emailUtil");
const path = require("path");

// Get all active deposit methods with details
const getActiveDepositMethods = async (req, res) => {
  try {
    const methods = await DepositMethod.findAll({
      where: { status: "active" },
      include: [
        { model: DepositMethodBankDetail },
        { model: DepositMethodCryptoDetail },
        { model: DepositMethodOtherDetail },
      ],
    });

    res.status(200).json({ methods });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching deposit methods." });
  }
};

// Create a new deposit request
const createDepositRequest = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { method_id, amount, transaction_reference } = req.body;

    if (!method_id || !amount) {
      return res.status(400).json({ message: "Method and amount are required." });
    }

    const method = await DepositMethod.findByPk(method_id);
    if (!method || method.status !== "active") {
      return res.status(404).json({ message: "Deposit method not found or inactive." });
    }

    let proofPath = null;
    if (req.file) {
      proofPath = req.file.path;
    }

    await DepositRequest.create({
      user_id: userId,
      method_id,
      amount,
      transaction_reference: transaction_reference || null,
      proof_path: proofPath,
      status: "pending",
    });

    // Fetch user details
    const user = await User.findByPk(userId);

    // Email setup
    const logoUrl = "https://equityfx.co.uk/assets/equityfxlogo-C8QlocGu.jpg";
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; color: #333; background-color: #fff; padding: 20px; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${logoUrl}" alt="EquityFX Logo" style="max-width: 150px; height: auto;" />
        </div>
        <h2 style="color: #0a0a0a;">Hello ${user.full_name},</h2>
        <p style="font-size: 15px; line-height: 1.6;">
          We have received your deposit request of <strong>$${amount}</strong>. 
        </p>
        <p style="font-size: 15px; line-height: 1.6;">
          Our review team will verify your deposit and update your wallet balance as soon as possible. You will be notified once it's processed.
        </p>
        <p style="font-size: 15px; line-height: 1.6;">
          Thank you for choosing EquityFX. If you have any questions, feel free to contact our support team.
        </p>
        <p style="margin-top: 30px; font-size: 14px; color: #555;">
          — The EquityFX Team
        </p>
      </div>
    `;

    await sendEmail(user.email, "EquityFX: Deposit Request Submitted", emailHtml);

    res.status(201).json({ message: "Deposit request submitted successfully." });
  } catch (error) {
    console.error("Error in createDepositRequest:", error);
    res.status(500).json({ message: "Server error while creating deposit request." });
  }
};

module.exports = {
  getActiveDepositMethods,
  createDepositRequest,
};
