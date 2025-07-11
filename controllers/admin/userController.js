const { User, KycDocument, DepositRequest, WalletTransaction, WithdrawalMethod } = require("../../models");
const bcrypt = require("bcrypt");

// Create a new user
const createUser = async (req, res) => {
  try {
    const { full_name, email, phone_number, country_code, password, role } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ message: "Full name, email, and password are required." });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "A user with this email already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      full_name,
      email,
      phone_number,
      country_code,
      password_hash,
      role: role || "client",
      email_verified: false,
    });

    res.status(201).json({ message: "User created successfully.", user: newUser });
  } catch (error) {
    console.error("Error in createUser:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get all users with optional pagination
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      offset: parseInt(offset),
      limit: parseInt(limit),
      order: [["created_at", "DESC"]],
      attributes: { exclude: ["password_hash", "verification_token", "reset_token", "reset_token_expiry"] },
    });

    res.status(200).json({
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      users: rows,
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get a single user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ["password_hash", "verification_token", "reset_token", "reset_token_expiry"] },
      include: [
        { model: KycDocument },
        { model: DepositRequest },
        { model: WalletTransaction },
        { model: WithdrawalMethod },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error in getUserById:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Update a user's data
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, phone_number, country_code, role, email_verified, password } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.full_name = full_name ?? user.full_name;
    user.phone_number = phone_number ?? user.phone_number;
    user.country_code = country_code ?? user.country_code;
    user.role = role ?? user.role;
    user.email_verified = email_verified ?? user.email_verified;

    if (password) {
      user.password_hash = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.status(200).json({ message: "User updated successfully.", user });
  } catch (error) {
    console.error("Error in updateUser:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    await user.destroy();

    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
