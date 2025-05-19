const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../models");
const User = db.users;
const validator = require("validator");
const userAuth = require("../middlewares/userAuth");
const fs = require("fs").promises;
const path = require("path");
const { Op } = require("sequelize");

const signup = async (req, res) => {
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

    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Signup error:", error);
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

const sendPasswordResetEmail = async (email, token) => {
  // const transporter = nodemailer.createTransport({
  //   service: "Gmail",
  //   auth: {
  //     user: process.env.EMAIL_USER,
  //     pass: process.env.EMAIL_PASS,
  //   },
  // });
  // const mailOptions = {
  //   from: process.env.EMAIL_USER,
  //   to: email,
  //   subject: "Password Reset",
  //   text: `You requested a password reset. Click the link to reset your password: ${process.env.FRONTEND_URL}/reset-password?token=${token}`,
  // };
  // await transporter.sendMail(mailOptions);
};

const resetPassword = async (req, res) => {
  // try {
  //   const { email } = req.body;
  //   if (!email) {
  //     return res.status(400).json({ message: "Email is required" });
  //   }
  //   const user = await User.findOne({ where: { email } });
  //   if (!user) {
  //     return res.status(404).json({ message: "User not found" });
  //   }
  //   const token = jwt.sign({ id: user.id }, process.env.secretKey, { expiresIn: "1h" });
  //   await sendPasswordResetEmail(email, token);
  //   return res.status(200).json({ message: "Password reset email sent" });
  // } catch (error) {
  //   console.error("Reset password error:", error);
  //   return res.status(500).json({ error: "Internal server error" });
  // }
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

module.exports = {
  signup,
  login,
  logout,
  getUser,
  uploadAvatar,
  removeAvatar,
  updateProfile,
  changePassword,
  updateNotificationPreferences,
  updatePrivacySettings,
};
