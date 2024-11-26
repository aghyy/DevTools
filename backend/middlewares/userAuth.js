const jwt = require("jsonwebtoken");
const db = require("../models");
const User = db.users;

const { Op } = require("sequelize");

const saveUser = async (req, res, next) => {
  try {
    const { firstName, lastName, username, email } = req.body;

    if (!firstName || !lastName || !username || !email) {
      return res.status(400).json({ message: "First name, last name, username, and email are required" });
    }

    console.log("Checking if user exists");

    const user = await User.findOne({
      where: {
        [Op.or]: [
          { username },
          { email },
        ],
      },
    });

    console.log("User:", user);

    if (user) {
      if (user.username === username) {
        return res.status(409).json({ message: "Username is already taken" });
      }
      if (user.email === email) {
        return res.status(409).json({ message: "Email is already registered" });
      }
    }

    next();
  } catch (error) {
    console.error("Error in saveUser middleware:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const verifyToken = async (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, process.env.secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = decoded;
    next();
  });
};

module.exports = {
  saveUser,
  verifyToken,
};