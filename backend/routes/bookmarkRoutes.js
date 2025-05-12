const express = require("express");
const bookmarkController = require("../controllers/bookmarkController");
const { 
  createBookmark, 
  getUserBookmarks, 
  getBookmarkById, 
  updateBookmark, 
  deleteBookmark, 
  getUserCategories, 
  getUserTags, 
  getPublicBookmarks 
} = bookmarkController;
const userAuth = require("../middlewares/userAuth");

const router = express.Router();

// Routes that require authentication
router.post("/", userAuth.verifyToken, createBookmark);
router.get("/", userAuth.verifyToken, getUserBookmarks);
router.get("/categories", userAuth.verifyToken, getUserCategories);
router.get("/tags", userAuth.verifyToken, getUserTags);
router.get("/:id", userAuth.verifyToken, getBookmarkById);
router.put("/:id", userAuth.verifyToken, updateBookmark);
router.delete("/:id", userAuth.verifyToken, deleteBookmark);

// Public route - doesn't require authentication
router.get("/public/:username", getPublicBookmarks);

module.exports = router; 