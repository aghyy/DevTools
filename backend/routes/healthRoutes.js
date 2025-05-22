const express = require("express");
const healthController = require("../controllers/healthController");
const { getSystemHealth } = healthController;
const userAuth = require("../middlewares/userAuth");

const router = express.Router();

// Get system health information
router.get("/system", userAuth.verifyToken, getSystemHealth);

module.exports = router; 