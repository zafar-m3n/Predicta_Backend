const {
  DepositMethod,
  DepositMethodBankDetail,
  DepositMethodCryptoDetail,
  DepositMethodOtherDetail,
  DepositRequest,
  WalletTransaction,
  User,
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
    } else if (type === "crypto") {
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
    } else if (type === "other") {
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
    console.error("Error in createDepositMethod:", error);
    res.status(500).json({ message: "Server error." });
  }
};

const getAllDepositMethods = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await DepositMethod.findAndCountAll({
      offset: parseInt(offset),
      limit: parseInt(limit),
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      methods: rows,
    });
  } catch (error) {
    console.error("Error in getAllDepositMethods:", error);
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
    console.error("Error in getDepositMethodById:", error);
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

    method.name = name ?? method.name;
    method.status = status ?? method.status;
    await method.save();

    if (method.type === "bank") {
      await DepositMethodBankDetail.update(
        {
          beneficiary_name: req.body.beneficiary_name,
          bank_name: req.body.bank_name,
          branch: req.body.branch,
          account_number: req.body.account_number,
          ifsc_code: req.body.ifsc_code,
        },
        { where: { method_id: id } }
      );
    } else if (method.type === "crypto") {
      await DepositMethodCryptoDetail.update(
        {
          network: req.body.network,
          address: req.body.address,
          qr_code_path: req.files?.qr_code?.[0]?.path,
          logo_path: req.files?.logo?.[0]?.path,
        },
        { where: { method_id: id } }
      );
    } else if (method.type === "other") {
      await DepositMethodOtherDetail.update(
        {
          qr_code_path: req.files?.qr_code?.[0]?.path,
          logo_path: req.files?.logo?.[0]?.path,
          notes: req.body.notes,
        },
        { where: { method_id: id } }
      );
    }

    res.status(200).json({ message: "Deposit method updated successfully." });
  } catch (error) {
    console.error("Error in updateDepositMethod:", error);
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
    console.error("Error in toggleDepositMethodStatus:", error);
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
    console.error("Error in approveDepositRequest:", error);
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
    console.error("Error in rejectDepositRequest:", error);
    res.status(500).json({ message: "Server error." });
  }
};

const getAllDepositRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await DepositRequest.findAndCountAll({
      include: [
        {
          model: User,
          attributes: ["id", "full_name", "email"],
        },
        {
          model: DepositMethod,
          attributes: ["id", "name", "type"],
        },
      ],
      order: [["created_at", "DESC"]],
      offset: parseInt(offset),
      limit: parseInt(limit),
    });

    res.status(200).json({
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      requests: rows,
    });
  } catch (error) {
    console.error("Error in getAllDepositRequests:", error);
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
  getAllDepositRequests,
};
