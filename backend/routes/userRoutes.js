const express = require("express");
const userController = require("../controllers/userController");
const { 
  signup, 
  login, 
  logout, 
  getUser, 
  forgotPassword,
  resetPassword,
  uploadAvatar, 
  removeAvatar,
  updateProfile,
  changePassword,
  updateNotificationPreferences,
  updatePrivacySettings,
  checkUsernameAvailability
} = userController;
const userAuth = require("../middlewares/userAuth");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads/avatars'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Auth routes
router.post("/signup", userAuth.saveUser, signup);
router.post("/login", login);
router.get("/check-username", checkUsernameAvailability);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/jwt-public-key", userAuth.getPublicKey);

// User profile routes
router.get("/user", userAuth.verifyToken, getUser);
router.put("/profile", userAuth.verifyToken, updateProfile);
router.put("/password", userAuth.verifyToken, changePassword);
router.put("/notifications", userAuth.verifyToken, updateNotificationPreferences);
router.put("/privacy", userAuth.verifyToken, updatePrivacySettings);

// Avatar routes
router.post("/avatar", userAuth.verifyToken, upload.single('avatar'), uploadAvatar);
router.delete("/avatar", userAuth.verifyToken, removeAvatar);

module.exports = router;