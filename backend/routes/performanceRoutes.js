const express = require("express");
const performanceController = require("../controllers/performanceController");
const { recordPerformance, getDailyAverages, getToolsBreakdown } = performanceController;
const userAuth = require("../middlewares/userAuth");

const router = express.Router();

// Record performance (optional auth - anonymous metrics allowed)
router.post("/", userAuth.optionalToken, recordPerformance);

// Get performance data (requires authentication)
router.get("/daily-averages", userAuth.verifyToken, getDailyAverages);

// Get tools breakdown data (requires authentication)
router.get("/tools-breakdown", userAuth.verifyToken, getToolsBreakdown);

module.exports = router; 