const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../models");
const User = db.users;
const validator = require('validator');

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

    const token = jwt.sign({ id: user.id }, process.env.secretKey, { expiresIn: "1d" });

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
      // If it's an email, find user by email
      user = await User.findOne({ where: { email: identifier } });
    } else {
      // If it's not an email, assume it's a username
      user = await User.findOne({ where: { username: identifier } });
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid username/email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username/email or password" });
    }

    const token = jwt.sign({ id: user.id }, process.env.secretKey, { expiresIn: "1d" });

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
  const userId = req.user.id;  // Assuming user ID is stored in `req.user.id`

  try {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },  // Exclude password from response
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

module.exports = { signup, login, logout, getUser };