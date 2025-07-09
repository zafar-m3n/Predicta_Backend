const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { User } = require("../models");
const { sendEmail } = require("../utils/emailUtil");
require("dotenv").config();

/* ---------- Register ---------- */
const register = async (req, res) => {
  const { full_name, email, password, phone_number, country_code } = req.body;
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use." });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const verification_token = crypto.randomBytes(32).toString("hex");

    const newUser = await User.create({
      full_name,
      email,
      password_hash,
      phone_number,
      country_code,
      verification_token,
      role: "client",
    });

    const verifyUrl = `${process.env.NODE_TRADERSROOM_CLIENT_URL}/verify-email?token=${verification_token}`;

    await sendEmail(
      email,
      "Verify your Traders Room account",
      `<p>Hello ${full_name},</p>
       <p>Please verify your email by clicking the link below:</p>
       <a href="${verifyUrl}">${verifyUrl}</a>`
    );

    res.status(201).json({ message: "Registration successful! Please check your email to verify your account." });
  } catch (err) {
    console.error("Error in register:", err);
    res.status(500).json({ message: "Server error." });
  }
};

/* ---------- Email verification ---------- */
const verifyEmail = async (req, res) => {
  const { token } = req.query;
  try {
    const user = await User.findOne({ where: { verification_token: token } });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token." });
    }

    user.email_verified = true;
    user.verification_token = null;
    await user.save();

    res.status(200).json({ message: "Email verified successfully. You can now log in." });
  } catch (err) {
    console.error("Error in verifyEmail:", err);
    res.status(500).json({ message: "Server error." });
  }
};

/* ---------- Login ---------- */
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    if (!user.email_verified) {
      return res.status(400).json({ message: "Please verify your email before logging in." });
    }

    const payload = {
      id: user.id,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.NODE_TRADERSROOM_JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        country_code: user.country_code,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Error in login:", err);
    res.status(500).json({ message: "Server error." });
  }
};

/* ---------- Forgot password ---------- */
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "User with this email does not exist." });
    }

    const reset_token = crypto.randomBytes(32).toString("hex");
    const reset_token_expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.reset_token = reset_token;
    user.reset_token_expiry = reset_token_expiry;
    await user.save();

    const resetUrl = `${process.env.NODE_TRADERSROOM_CLIENT_URL}/reset-password?token=${reset_token}`;

    await sendEmail(
      email,
      "Password Reset Request",
      `<p>Hello ${user.full_name},</p>
       <p>Reset your password by clicking the link below:</p>
       <a href="${resetUrl}">${resetUrl}</a>`
    );

    res.status(200).json({ message: "Password reset email sent." });
  } catch (err) {
    console.error("Error in forgotPassword:", err);
    res.status(500).json({ message: "Server error." });
  }
};

/* ---------- Reset password ---------- */
const resetPassword = async (req, res) => {
  const { token } = req.query;
  const { password } = req.body;
  try {
    const user = await User.findOne({ where: { reset_token: token } });
    if (!user || user.reset_token_expiry < new Date()) {
      return res.status(400).json({ message: "Invalid or expired reset token." });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    user.password_hash = password_hash;
    user.reset_token = null;
    user.reset_token_expiry = null;
    await user.save();

    res.status(200).json({ message: "Password reset successful. You can now log in." });
  } catch (err) {
    console.error("Error in resetPassword:", err);
    res.status(500).json({ message: "Server error." });
  }
};

/* ---------- Export all functions ---------- */
module.exports = {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
};
