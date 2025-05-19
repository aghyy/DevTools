const express = require("express");
const userController = require("../controllers/userController");
const { signup, login, logout, getUser } = userController;
const userAuth = require("../middlewares/userAuth");

const router = express.Router();

router.post("/signup", userAuth.saveUser, signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/user", userAuth.verifyToken, getUser);
router.get("/jwt-public-key", userAuth.getPublicKey);

module.exports = router;