const express = require("express");
const userController = require("../controllers/userController");
const { signup, login, logout, getUser, uploadAvatar, removeAvatar } = userController;
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

router.post("/signup", userAuth.saveUser, signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/user", userAuth.verifyToken, getUser);
router.get("/jwt-public-key", userAuth.getPublicKey);
router.post("/avatar", userAuth.verifyToken, upload.single('avatar'), uploadAvatar);
router.delete("/avatar", userAuth.verifyToken, removeAvatar);

module.exports = router;