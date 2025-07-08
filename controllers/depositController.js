const {
  DepositMethod,
  DepositMethodBankDetail,
  DepositMethodCryptoDetail,
  DepositMethodOtherDetail,
  DepositRequest,
} = require("../../models");

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
    const userId = req.user.id; // From auth middleware
    const { method_id, amount } = req.body;

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
      proof_path: proofPath,
      status: "pending",
    });

    res.status(201).json({ message: "Deposit request submitted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while creating deposit request." });
  }
};

module.exports = {
  getActiveDepositMethods,
  createDepositRequest,
};
