const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../models");
const User = db.users;
const validator = require("validator");
const userAuth = require("../middlewares/userAuth");
const fs = require("fs").promises;
const path = require("path");
const { Op } = require("sequelize");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const createAccount = async (req, res) => {
  try {
    const { firstName, lastName, username, email, password } = req.body;

    if (!firstName || !lastName || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      {
        id: user.id,
        user_id: user.id,
        token_type: "access",
      },
      userAuth.privateKey,
      {
        algorithm: "RS256",
        expiresIn: "1d",
        jwtid: require("crypto").randomBytes(16).toString("hex"),
      }
    );

    res.cookie("jwt", token, {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.status(201).json({ message: "Account created successfully" });
  } catch (error) {
    console.error("Create account error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Check if the identifier is an email or username
    let user;
    if (validator.isEmail(identifier)) {
      user = await User.findOne({ where: { email: identifier } });
    } else {
      user = await User.findOne({ where: { username: identifier } });
    }

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid username/email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Invalid username/email or password" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        user_id: user.id,
        token_type: "access",
      },
      userAuth.privateKey,
      {
        algorithm: "RS256",
        expiresIn: "1d",
        jwtid: require("crypto").randomBytes(16).toString("hex"),
      }
    );

    res.cookie("jwt", token, {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const logout = (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  return res.status(200).json({ message: "Logged out successfully" });
};

const getUser = async (req, res) => {
  const userId = req.user.id; // Assuming user ID is stored in `req.user.id`

  try {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] }, // Exclude password from response
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user data:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, new_password, confirm_password } = req.body;

    if (!token || !new_password || !confirm_password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          [Op.gt]: new Date() // Token hasn't expired
        }
      }
    });

    if (!user) {
      return res.status(400).json({ 
        message: "Invalid or expired reset token. Please request a new password reset link." 
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update user's password and clear reset token
    await user.update({
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null
    });

    return res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const userId = req.user.id;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete old avatar if exists
    if (user.avatar) {
      const oldAvatarPath = path.join(
        __dirname,
        "../public/uploads/avatars",
        user.avatar
      );
      try {
        await fs.unlink(oldAvatarPath);
      } catch (error) {
        console.error("Error deleting old avatar:", error);
      }
    }

    // Update user with new avatar filename
    await user.update({ avatar: req.file.filename });

    // Fetch the updated user data
    const updatedUser = await User.findByPk(userId);
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const removeAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.avatar) {
      const avatarPath = path.join(
        __dirname,
        "../public/uploads/avatars",
        user.avatar
      );
      try {
        await fs.unlink(avatarPath);
      } catch (error) {
        console.error("Error deleting avatar file:", error);
      }
    }

    await user.update({ avatar: null });

    // Fetch the updated user data
    const updatedUser = await User.findByPk(userId);
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error removing avatar:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { firstName, lastName, username, email } = req.body;

  try {
    // Check if username or email is already taken by another user
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { username, id: { [Op.ne]: userId } },
          { email, id: { [Op.ne]: userId } },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(409).json({ message: "Username is already in use" });
      }
      if (existingUser.email === email) {
        return res.status(409).json({ message: "Email is already in use" });
      }
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.update({
      firstName,
      lastName,
      username,
      email,
    });

    // Fetch the updated user data
    const updatedUser = await User.findByPk(userId);
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const changePassword = async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const updateNotificationPreferences = async (req, res) => {
  const userId = req.user.id;
  const { emailNotifications, pushNotifications, marketingEmails } = req.body;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.update({
      emailNotifications,
      pushNotifications,
      marketingEmails,
    });

    // Fetch the updated user data
    const updatedUser = await User.findByPk(userId);
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const updatePrivacySettings = async (req, res) => {
  const userId = req.user.id;
  const { profileVisibility, showEmail, showActivity } = req.body;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.update({
      profileVisibility,
      showEmail,
      showActivity,
    });

    // Fetch the updated user data
    const updatedUser = await User.findByPk(userId);
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating privacy settings:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email field is required" });
    }

    const user = await User.findOne({ 
      where: { 
        email: { [Op.iLike]: email } // Case-insensitive email search
      } 
    });

    // Always return success even if user doesn't exist (security best practice)
    if (!user) {
      return res.status(200).json({ 
        message: "If this email is registered, you will receive a reset link." 
      });
    }

    // Generate password reset token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store token and expiry in user record
    await user.update({
      resetToken: token,
      resetTokenExpiry: tokenExpiry
    });

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;

    // Send email
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // your app password
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Password Reset Request",
      text: `Click the link to reset your password: ${resetUrl}`,
      html: `
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    });

    return res.status(200).json({ 
      message: "If this email is registered, you will receive a reset link." 
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const checkUsernameAvailability = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const existingUser = await User.findOne({
      where: { username }
    });

    return res.status(200).json({ available: !existingUser });
  } catch (error) {
    console.error("Error checking username availability:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const checkEmailAvailability = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const existingUser = await User.findOne({
      where: { email }
    });

    return res.status(200).json({ available: !existingUser });
  } catch (error) {
    console.error("Error checking email availability:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createAccount,
  login,
  logout,
  getUser,
  forgotPassword,
  resetPassword,
  uploadAvatar,
  removeAvatar,
  updateProfile,
  changePassword,
  updateNotificationPreferences,
  updatePrivacySettings,
  checkUsernameAvailability,
  checkEmailAvailability
};
