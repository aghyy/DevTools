const express = require("express");
const codeSnippetController = require("../controllers/codeSnippetController");
const { 
  createCodeSnippet, 
  getUserCodeSnippets, 
  getCodeSnippetById, 
  updateCodeSnippet, 
  deleteCodeSnippet, 
  getUserLanguages, 
  getUserTags, 
  getPublicCodeSnippets,
  getAllPublicCodeSnippets
} = codeSnippetController;
const userAuth = require("../middlewares/userAuth");

const router = express.Router();

// Routes that require authentication
router.post("/", userAuth.verifyToken, createCodeSnippet);
router.get("/", userAuth.verifyToken, getUserCodeSnippets);
router.get("/languages", userAuth.verifyToken, getUserLanguages);
router.get("/tags", userAuth.verifyToken, getUserTags);

// Public routes - don't require authentication
router.get("/public", getAllPublicCodeSnippets);
router.get("/public/:username", getPublicCodeSnippets);

// Routes with ID parameter - must come after more specific routes
router.get("/:id", userAuth.verifyToken, getCodeSnippetById);
router.put("/:id", userAuth.verifyToken, updateCodeSnippet);
router.delete("/:id", userAuth.verifyToken, deleteCodeSnippet);

module.exports = router; 