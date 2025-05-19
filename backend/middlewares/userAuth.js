const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const db = require("../models");
const User = db.users;

const { Op } = require("sequelize");

const privateKey = fs.readFileSync(
  path.join(__dirname, "../keys/private.pem"),
  "utf8"
);

const publicKey = fs.readFileSync(
  path.join(__dirname, "../keys/public.pem"),
  "utf8"
);

const saveUser = async (req, res, next) => {
  try {
    const { firstName, lastName, username, email } = req.body;

    if (!firstName || !lastName || !username || !email) {
      return res
        .status(400)
        .json({
          message: "First name, last name, username, and email are required",
        });
    }

    console.log("Checking if user exists");

    const user = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }],
      },
    });

    if (user) {
      if (user.username === username) {
        return res.status(409).json({ message: "Username is already in use" });
      }
      if (user.email === email) {
        return res.status(409).json({ message: "Email is already in use" });
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

  jwt.verify(token, publicKey, { algorithms: ["RS256"] }, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = decoded;
    next();
  });
};

// Add a new endpoint to get the public key
const getPublicKey = (req, res) => {
  res.json({ publicKey });
};

module.exports = {
  saveUser,
  verifyToken,
  getPublicKey,
  privateKey,
};
