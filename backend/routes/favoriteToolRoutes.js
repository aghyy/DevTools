const express = require("express");
const favoriteToolController = require("../controllers/favoriteToolController");
const { 
  addFavoriteTool, 
  getUserFavoriteTools, 
  removeFavoriteTool,
  updateFavoritePositions
} = favoriteToolController;
const userAuth = require("../middlewares/userAuth");

const router = express.Router();

// Routes that require authentication
router.post("/", userAuth.verifyToken, addFavoriteTool);
router.get("/", userAuth.verifyToken, getUserFavoriteTools);
router.delete("/:id", userAuth.verifyToken, removeFavoriteTool);
router.put("/positions", userAuth.verifyToken, updateFavoritePositions);

module.exports = router; 