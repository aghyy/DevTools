const express = require("express");
const activityController = require("../controllers/activityController");
const { trackActivity, getUserActivities, getActivityStats, getMostUsedItems } = activityController;
const userAuth = require("../middlewares/userAuth");

const router = express.Router();

// Track user activity - requires authentication
router.post("/", userAuth.verifyToken, trackActivity);

// Get user's recent activities
router.get("/", userAuth.verifyToken, getUserActivities);

// Get user's activity statistics
router.get("/stats", userAuth.verifyToken, getActivityStats);

// Get user's most used items
router.get("/most-used", userAuth.verifyToken, getMostUsedItems);

module.exports = router; 