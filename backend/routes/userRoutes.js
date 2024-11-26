const express = require("express");
const userController = require("../controllers/userController");
const { signup, login, logout, getUser } = userController;
const userAuth = require("../middlewares/userAuth");

const router = express.Router();

router.post("/signup", userAuth.saveUser, signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/", userAuth.verifyToken, getUser);

module.exports = router;