const {
  DepositMethod,
  DepositMethodBankDetail,
  DepositMethodCryptoDetail,
  DepositMethodOtherDetail,
  DepositRequest,
  WalletTransaction,
} = require("../../models");

const createDepositMethod = async (req, res) => {
  try {
    const { type, name, status } = req.body;

    if (!type || !name) {
      return res.status(400).json({ message: "Type and name are required." });
    }

    const depositMethod = await DepositMethod.create({
      type,
      name,
      status: status || "active",
    });

    const methodId = depositMethod.id;

    if (type === "bank") {
      const { beneficiary_name, bank_name, branch, account_number, ifsc_code } = req.body;

      await DepositMethodBankDetail.create({
        method_id: methodId,
        beneficiary_name,
        bank_name,
        branch,
        account_number,
        ifsc_code,
      });
    }

    if (type === "crypto") {
      const { network, address } = req.body;
      const qr_code_path = req.files?.qr_code?.[0]?.path || null;
      const logo_path = req.files?.logo?.[0]?.path || null;

      await DepositMethodCryptoDetail.create({
        method_id: methodId,
        network,
        address,
        qr_code_path,
        logo_path,
      });
    }

    if (type === "other") {
      const { notes } = req.body;
      const qr_code_path = req.files?.qr_code?.[0]?.path || null;
      const logo_path = req.files?.logo?.[0]?.path || null;

      await DepositMethodOtherDetail.create({
        method_id: methodId,
        qr_code_path,
        logo_path,
        notes,
      });
    }

    res.status(201).json({ message: "Deposit method created successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

const getAllDepositMethods = async (req, res) => {
  try {
    const methods = await DepositMethod.findAll();
    res.status(200).json({ methods });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

const getDepositMethodById = async (req, res) => {
  try {
    const { id } = req.params;

    const method = await DepositMethod.findByPk(id);
    if (!method) {
      return res.status(404).json({ message: "Deposit method not found." });
    }

    let details = null;
    if (method.type === "bank") {
      details = await DepositMethodBankDetail.findOne({ where: { method_id: id } });
    } else if (method.type === "crypto") {
      details = await DepositMethodCryptoDetail.findOne({ where: { method_id: id } });
    } else if (method.type === "other") {
      details = await DepositMethodOtherDetail.findOne({ where: { method_id: id } });
    }

    res.status(200).json({ method, details });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

const updateDepositMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    const method = await DepositMethod.findByPk(id);
    if (!method) {
      return res.status(404).json({ message: "Deposit method not found." });
    }

    method.name = name || method.name;
    method.status = status || method.status;
    await method.save();

    if (method.type === "bank") {
      const updateData = {
        beneficiary_name: req.body.beneficiary_name,
        bank_name: req.body.bank_name,
        branch: req.body.branch,
        account_number: req.body.account_number,
        ifsc_code: req.body.ifsc_code,
      };
      await DepositMethodBankDetail.update(updateData, { where: { method_id: id } });
    } else if (method.type === "crypto") {
      const updateData = {
        network: req.body.network,
        address: req.body.address,
        qr_code_path: req.files?.qr_code?.[0]?.path || undefined,
        logo_path: req.files?.logo?.[0]?.path || undefined,
      };
      await DepositMethodCryptoDetail.update(updateData, { where: { method_id: id } });
    } else if (method.type === "other") {
      const updateData = {
        qr_code_path: req.files?.qr_code?.[0]?.path || undefined,
        logo_path: req.files?.logo?.[0]?.path || undefined,
        notes: req.body.notes,
      };
      await DepositMethodOtherDetail.update(updateData, { where: { method_id: id } });
    }

    res.status(200).json({ message: "Deposit method updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

const toggleDepositMethodStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const method = await DepositMethod.findByPk(id);
    if (!method) {
      return res.status(404).json({ message: "Deposit method not found." });
    }

    method.status = status;
    await method.save();

    res.status(200).json({ message: `Deposit method status updated to ${status}.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

const approveDepositRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const depositRequest = await DepositRequest.findByPk(id);
    if (!depositRequest) {
      return res.status(404).json({ message: "Deposit request not found." });
    }

    if (depositRequest.status !== "pending") {
      return res.status(400).json({ message: "Only pending requests can be approved." });
    }

    depositRequest.status = "approved";
    await depositRequest.save();

    await WalletTransaction.create({
      user_id: depositRequest.user_id,
      type: "deposit",
      amount: depositRequest.amount,
      reference_id: depositRequest.id,
      description: "Deposit approved by admin",
    });

    res.status(200).json({ message: "Deposit request approved and wallet updated." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

const rejectDepositRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_note } = req.body;

    const depositRequest = await DepositRequest.findByPk(id);
    if (!depositRequest) {
      return res.status(404).json({ message: "Deposit request not found." });
    }

    if (depositRequest.status !== "pending") {
      return res.status(400).json({ message: "Only pending requests can be rejected." });
    }

    depositRequest.status = "rejected";
    depositRequest.admin_note = admin_note || "Rejected by admin";
    await depositRequest.save();

    res.status(200).json({ message: "Deposit request rejected successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  createDepositMethod,
  getAllDepositMethods,
  getDepositMethodById,
  updateDepositMethod,
  toggleDepositMethodStatus,
  approveDepositRequest,
  rejectDepositRequest,
};
