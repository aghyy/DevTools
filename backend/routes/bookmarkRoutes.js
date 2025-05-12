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
  getPublicBookmarks,
  getAllPublicBookmarks
} = bookmarkController;
const userAuth = require("../middlewares/userAuth");

const router = express.Router();

// Routes that require authentication
router.post("/", userAuth.verifyToken, createBookmark);
router.get("/", userAuth.verifyToken, getUserBookmarks);
router.get("/categories", userAuth.verifyToken, getUserCategories);
router.get("/tags", userAuth.verifyToken, getUserTags);

// Public routes - don't require authentication
router.get("/public", getAllPublicBookmarks);
router.get("/public/:username", getPublicBookmarks);

// Routes with ID parameter - must come after more specific routes
router.get("/:id", userAuth.verifyToken, getBookmarkById);
router.put("/:id", userAuth.verifyToken, updateBookmark);
router.delete("/:id", userAuth.verifyToken, deleteBookmark);

module.exports = router; 