const express = require("express");
const widgetController = require("../controllers/widgetController");
const { getUserWidgets, updateUserWidgets, addWidget, removeWidget, getAvailableWidgets } = widgetController;
const userAuth = require("../middlewares/userAuth");

const router = express.Router();

// Get available widget types (must come before /:widgetId)
router.get("/available", userAuth.verifyToken, getAvailableWidgets);

// Get user widgets
router.get("/", userAuth.verifyToken, getUserWidgets);

// Update user widgets (bulk update for drag and drop)
router.put("/", userAuth.verifyToken, updateUserWidgets);

// Add a single widget
router.post("/", userAuth.verifyToken, addWidget);

// Remove a widget
router.delete("/:widgetId", userAuth.verifyToken, removeWidget);

module.exports = router; 